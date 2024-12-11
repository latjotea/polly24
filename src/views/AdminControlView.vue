<template>
    
    <div>
    <div class="button-container">
      <button  > {{this.uiLabels.seeMap}} </button>
      <button  >{{this.uiLabels.seeTasks}}</button>
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