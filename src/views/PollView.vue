<template>
  <div>
    {{crawlId}}
    <QuestionComponent v-bind:question="question"
              v-on:answer="submitAnswer($event)"/>
    <hr>
    <span>{{submittedAnswers}}</span>
  </div>
</template>

<script>
// @ is an alias to /src
import QuestionComponent from '@/components/QuestionComponent.vue';
import io from 'socket.io-client';
const socket = io(sessionStorage.getItem(dataServer));

export default {
  name: 'PollView',
  components: {
    QuestionComponent
  },
  data: function () {
    return {
      question: {
        q: "",
        a: []
      },
      crawlId: "inactive poll",
      submittedAnswers: {}
    }
  },
  created: function () {
    this.crawlId = this.$route.params.id;
    socket.on( "questionUpdate", q => this.question = q );
    socket.on( "submittedAnswersUpdate", answers => this.submittedAnswers = answers );
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
    socket.emit( "joinCrawl", this.crawlId );
  },
  methods: {
    submitAnswer: function (answer) {
      socket.emit("submitAnswer", {crawlId: this.crawlId, answer: answer})
    }
  }
}
</script>
