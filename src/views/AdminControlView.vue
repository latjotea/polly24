<template>
  <body>
    <div>
      <div v-if="!crawlOver" class="button-container">
        <button v-on:click="sendToNextPub"> {{this.uiLabels.nextStop}} </button> 
        <button v-on:click="goToCreateTask">{{this.uiLabels.createTasks}} </button>
      </div>

      <div v-if="!crawlOver" class="map-button">
          <button v-on:click="navigateToInteractiveMap">
              {{this.uiLabels.seeMap}}
          </button>
      </div>
    </div>  
  </body>
</template>


<script>

import io from 'socket.io-client';
import tasksen from '/server/data/tasksEn.json';
import taskssv from '/server/data/tasksSv.json';

const socket = io(sessionStorage.getItem(dataServer));

export default {
  name: 'AdminControlView',
  data: function () {
    return {
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      city:"",
      adminId: "",
      crawlId:"",
      round: 1,
      selectedPubs: [],
      crawlOver: false,
      pubsLoaded: false
    }
},

created: function () {
    this.crawlId = this.$route.params.id;
    this.adminId = this.$route.params.adminId;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
    
    socket.on("currentRoundResponse", (round) => {
      this.round = round; 
      console.log("runda:", this.round);
      if (this.pubsLoaded){
        this.isCrawlOver();
      }
    });
    socket.emit("getRound", {crawlId: this.crawlId});
    
    socket.emit("joinCrawl", this.crawlId);
    socket.emit("joinCrawl", this.teamNumber);

    socket.on("selectedPubsResponse", (selectedPubs) => {
      this.selectedPubs = selectedPubs;
      this.pubsLoaded = true;
      console.log("Hämtade pubar från servern:", this.selectedPubs); 
      console.log("Antal valda pubar", this.selectedPubs.length)
      this.isCrawlOver
    });
    socket.emit("getSelectedPubs", {crawlId: this.crawlId });
  },

  methods: {
    goToCreateTask: function () {
      this.$router.push(`/task/${this.crawlId}/${this.adminId}/`);
    },

    sendToNextPub: function() {
      socket.emit("goToNextPub", this.crawlId);
      socket.emit("updateRound", { crawlId: this.crawlId });
      socket.emit("getRound", { crawlId: this.crawlId });
    },

    navigateToInteractiveMap(){
      this.$router.push(`/interactivemap/${this.crawlId}/${this.adminId}`);
    },

    isCrawlOver() {
      if (!this.pubsLoaded || this.selectedPubs.length === 0){
        return;
      }
      console.log(this.selectedPubs.length);
      console.log(this.round);
      if (this.round > this.selectedPubs.length) {
        this.crawlOver = true
        this.$router.push(`/result/${this.crawlId}/${this.adminId}/`);
      }
    }
  }
}

</script>


<style>

body{
  margin-top: 1rem;
  background-color:rgb(255, 240, 245);
  font-family: 'Galindo';
  height: 100vh;
  }
  div {
  font-size: 1.7rem;
  font-family: 'Galindo';
  }

  .map-button{
    position: relative;
    top: -8rem;   
}

  button {
    font-size: 2rem;
    font-family: 'Galindo';
    background-color: rgb(65, 105, 225);
    cursor:pointer;
    border-radius: 15px; /* Gör hörnen rundade */
    border-color: white;
    box-shadow: 2px 2px 6px rgba(246, 53, 143, 0.5);
  }
  button:hover{
    color: white;
  }
  .button-container {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Två kolumner */
  grid-template-rows: 1fr 1fr; /* Två rader */
  gap: 0.5rem; /* Mellanrum mellan knapparna */
  height: 80vh; /* Fyll en stor del av höjden */
  margin-top: 10rem;
  margin-left: 3rem;
  margin-right: 3rem;
}




</style>