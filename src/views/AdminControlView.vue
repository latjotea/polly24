<template>
    
    <div>
    <div class="button-container">
      <button> {{this.uiLabels.nextStop}} </button>
      <button v-on:click="goToCreateTask">{{this.uiLabels.createTasks}} </button>
    </div>

    <div class="map-button">
        <button>
            {{this.uiLabels.seeMap}}
        </button>
    </div>


    </div>  



</template>


<script>

import io from 'socket.io-client';
import tasksen from '/server/data/tasksEn.json';
import taskssv from '/server/data/tasksSv.json';

const socket = io("localhost:3000");

export default {
  name: 'CityView',
  data: function () {
    return {
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      city:""
    }
},

created: function () {
    this.crawlId = this.$route.params.id;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
    socket.emit("getCity", {crawlId: this.crawlId });
    socket.emit("getSelectedPubs", {crawlId: this.crawlId });
    socket.emit("getMode", {crawlId: this.crawlId });
    // vi vill hämta lagen här också//


  },

  methods: {
    goToCreateTask: function () {
      this.$router.push(`/admintask/${this.crawlId}/`);
    },
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