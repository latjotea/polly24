<template>
  <div>
    <div>
    {{ uiLabels.createCrawlId }} 
    </div>
    <input type="text" placeholder="Ex. 1234" v-model="crawlId">
    <button v-on:click="handleCrawlIdButtom">
      {{ uiLabels.sendPubs }}
    </button>
  </div>
</template>

<script>
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'CreateView',
  data: function () {
    return {
      lang: localStorage.getItem("lang") || "en",
      crawlId: "",
      pollData: {},
      uiLabels: {},
    }
  },
  created: function () {
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on( "pollData", data => this.pollData = data );
    socket.on( "participantsUpdate", p => this.pollData.participants = p );
    socket.emit( "getUILabels", this.lang );
  },
  methods: {
    createCrawl: function () {
      socket.emit("createCrawl", {crawlId: this.crawlId, lang: this.lang })
      socket.emit("joinPoll", this.crawlId);
    },

    handleCrawlIdButtom(){
      this.createCrawl();
      this.$router.push(`/${this.crawlId}/mode/`);
    }
  }
}
</script>

<style>
body{
  margin-top: 12rem;
  background-color:rgb(255, 240, 245);
  font-family: 'Galindo';
  height: 100vh;
  }
  div {
  font-size: 1.7rem;
  font-family: 'Galindo';
  }

  button {
    font-size: 2rem;
    font-family: 'Galindo';
    background-color: rgb(65, 105, 225);
    cursor:pointer;
  }
  button:hover{
    color:white;
  }
  input{
    font-size:2rem;
    font-family: 'Galindo';
  }
  
</style>

