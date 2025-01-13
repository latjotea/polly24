
<template>
  <body>
    <div>
      {{this.uiLabels.chooseMode}}
      <div class="button-container">
        <button class="blue-button" v-on:click="chooseMode('standard')"> {{this.uiLabels.standardCrawl }} </button>
        <button class="blue-button" v-on:click="chooseMode('love')">{{this.uiLabels.loveCrawl}}</button>
        <button class="blue-button" v-on:click="chooseMode('holiday')">{{this.uiLabels.holidayCrawl}}</button>
        <button class="blue-button" v-on:click="chooseMode('crazy')">{{this.uiLabels.crazyCrawl}}</button>
      </div>  
    </div>
  </body>
</template>

<script>
import io from 'socket.io-client';
const socket = io(sessionStorage.getItem("dataServer"));

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

<style scoped>
  div {
  font-size: 1.7rem;
  }
 
  .button-container {
  display: grid;
  grid-template-columns: 1fr 1fr; 
  grid-template-rows: 1fr 1fr; 
  gap: 0.5rem; 
  width: 100%; 
  height: 80vh; 
  margin-top: 1rem;
}

@media screen and (max-width: 600px) {
  .button-container {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr); /* AI FÖR ATT FÅ LIKA STORA */
    height: 70vh; 
    gap:0.1rem
  }
}
  
</style>
