<template>
  <div>
    <h1>
    {{ uiLabels.createCrawlId }} 
    </h1>
    <input type="text" placeholder="Ex. STS RUNDAN" v-model="crawlId">
    <button v-on:click="handleCrawlIdButton" class="green-button">
      {{ uiLabels.sendPubs }}
    </button>
    <div v-if="takenCrawlId" class ="invalid">
        <p>{{ this.uiLabels.takenCrawlId }}</p>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';
const socket = io(sessionStorage.getItem("dataServer"));

export default {
  name: 'CreateView',
  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      crawlId: "",
      pollData: {},
      uiLabels: {},
      takenCrawlId: false,
    }
  },
  created: function () {
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );

    socket.on( "pollData", data => this.pollData = data );
    socket.on( "participantsUpdate", p => this.pollData.participants = p );
    
  },
  
  methods: {
    cleanUpLocalStorage(crawlId){
      localStorage.removeItem(`tasks_${crawlId}`)
      localStorage.removeItem(`scores_${crawlId}`);

    },

    createCrawl: function () {
      socket.emit("createCrawl", {crawlId: this.crawlId, lang: this.lang })
      socket.emit("joinCrawl", this.crawlId);
    },

    handleCrawlIdButton(){
    socket.emit("checkActiveCrawl", { crawlId: this.crawlId });
    socket.once("activeCrawlResponse", (isActive) => {
      if (isActive) {
        this.takenCrawlId = true;
      } 
      else {
        this.cleanUpLocalStorage(this.crawlId);
        this.takenCrawlId = false;
        socket.emit("createCrawl", { crawlId: this.crawlId, lang: this.lang });
        socket.emit("joinCrawl", this.crawlId);
        this.$router.push(`/${this.crawlId}/CreateTeam/`);
      }
      }
    )}
  }
}
</script>

<style scoped>
body{
  margin-top: 12rem;
  }



  
</style>

