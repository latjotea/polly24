/*/ TEA OCH EMMA ANSVARIG FÖR SENASTE VERSIONEN /*/
<template>
  <div>
    {{this.uiLabels.chooseMode}}
    <div class="button-container">
      <button v-on:click="chooseMode('standard')"> {{this.uiLabels.standardCrawl }} </button>
      <button v-on:click="chooseMode('love')">{{this.uiLabels.loveCrawl}}</button>
      <button v-on:click="chooseMode('golf')">{{this.uiLabels.golfCrawl}}</button>
      <button v-on:click="chooseMode('crazy')">{{this.uiLabels.crazyCrawl}}</button>
    </div>  
  </div>


</template>

<script>
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'ModeView',
  data: function () {
    return {
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      mode:'',
    }
  },
  created: function () {
    this.crawlId = this.$route.params.id;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
  },
  methods: {
    chooseMode: function (mode) {
      this.mode=mode;
      socket.emit("setMode", {crawlId: this.crawlId, mode:this.mode })
      this.$router.push(`/${this.crawlId}/city/`);
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
  button {
    font-size: 2rem;
    font-family: 'Galindo';
    background-color: rgb(65, 105, 225);
    cursor:pointer;
  }
  button:hover{
    color: white;
  }
  .button-container {
  display: grid;
  grid-template-columns: 1fr 1fr; /* Två kolumner */
  grid-template-rows: 1fr 1fr; /* Två rader */
  gap: 0.5rem; /* Mellanrum mellan knapparna */
  width: 100%; /* Fyll en stor del av bredden */
  height: 80vh; /* Fyll en stor del av höjden */
  margin-top: 1rem;
}
  
</style>
