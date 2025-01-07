/*/ TEA OCH EMMA ANSVARIG FÖR SENASTE VERSIONEN /*/
<template>
  <div>
    {{this.uiLabels.chooseCity}}
    <div class="button-container">
      <button v-on:click="chooseCity('Uppsala')" > Uppsala </button>
      <button v-on:click="chooseCity('Stockholm')" > Stockholm </button>
      <button v-on:click="chooseCity('Malmö')" > Malmö </button>
    </div>  
  </div>
</template>

<script>
import io from 'socket.io-client';
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
  },
  methods: {
    chooseCity: function (city) {
      this.city=city;
      socket.emit("setCity", {crawlId: this.crawlId, city:this.city })
      this.$router.push(`/${this.crawlId}/pubList/`);
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
  grid-template-rows: 1fr 1fr 1fr; 
  grid-template-columns: 1fr;
  gap: 0.5rem; 
  width: 100%; 
  height: 80vh; 
  margin-top: 1rem;
}
  
</style>
