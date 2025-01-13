
<template>
  <body>
    <div>
      <h3> {{this.uiLabels.chooseCity}} </h3>
      <div class="button-container">
        <button class="blue-button" v-on:click="chooseCity('Uppsala')" > Uppsala </button>
        <button class="blue-button" v-on:click="chooseCity('Stockholm')" > Stockholm </button>
        <button class="blue-button" v-on:click="chooseCity('Malmö')" > Malmö </button>
      </div>  
    </div>
  </body>
</template>

<script>
import io from 'socket.io-client';
const socket = io(sessionStorage.getItem("dataServer"));

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

<style scoped>

  div {
  font-size: 1.7rem;
  }

  h3{
    margin-top: 3rem;
  }

  .button-container {
  display: grid;
  grid-template-rows: 1fr 1fr 1fr; 
  grid-template-columns: 1fr;
  width: 100%; 
  height: 80vh; 
}
  
</style>
