/*/ TEA OCH EMMA ANSVARIG FÖR SENASTE VERSIONEN /*/
<template>
  <div>
    {{this.uiLabels.chooseCity}}
    <div class="button-container">
      <button v-on:click="navigateToCity"> Uppsala </button>
      <button v-on:click="navigateToCity">Stockholm</button>
      <button v-on:click="navigateToCity">Malmö</button>
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
      mode:{}
    }
  },
  created: function () {
    this.pollId = this.$route.params.id;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
  },
  methods: {
    navigateToCity() {
    this.$router.push('/city/');
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
  gap: 0.5rem; 
  width: 100%; 
  height: 80vh; 
  margin-top: 1rem;
}
  
</style>
