<template>
  <div>
    <div>
    {{ uiLabels.createCrawlId }} 
    </div>
    <input type="text" placeholder="Ex. Bästa Rundan 123" v-model="crawlId">
    <button v-on:click="handleCrawlIdButton">
      {{ uiLabels.sendPubs }}
    </button>
    <div v-if="takenCrawlId" id ="takenCrawlId">
        <p>{{ this.uiLabels.takenCrawlId }}</p>
    </div>
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
      takenCrawlId: false,
    }
  },
  created: function () {
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );

    socket.on("activeCrawlResponse", (isActive) => {
      console.log("Finns redan", isActive)
      this.takenCrawlId = isActive });
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

  #takenCrawlId {
    color: red;
  }
  
</style>

