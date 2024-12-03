<template>
    <body>
      <h1 v-if="chosenPub">{{ uiLabels.goTo }} {{ chosenPub }}</h1>

      <div id="goto"> 
        <button v-on:click="this.chooseRandomPub()"> 
          {{ uiLabels.imHere }}
        </button>
    </div>
    </body>
</template>


<script>
import io from 'socket.io-client';
const socket = io("localhost:3000");




export default{
    name:"DestinationView",
    
data: function () {
    return {
      uiLabels: {},
      teamPubs: [],
      chosenPub: null,
      selectedPubs: [],
    }
  },
  created: function () {
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
    socket.emit("getSelectedPubs", (selectedPubs) => {
    this.selectedPubs = selectedPubs;
    console.log("Hämtade pubar från servern:", this.selectedPubs);
    this.chooseRandomPub(); // Välj en slumpad pub efter att ha hämtat pubarna
    });

  },

  

  methods: {
    chooseRandomPub() {
      /*if(this.selectedPubs.length === 0) {
        this.$router.push("/result"); // Ersätt "/ny-sida" med den faktiska sidan Tagit från chatgpt
        return;

      }*/

      const randomIndex = Math.floor(Math.random() * this.selectedPubs.length);
      const selectedPub = this.selectedPubs.splice(randomIndex, 1)[0]; // Ta bort från `selectedPubs`
      this.teamPubs.push(selectedPub);

      this.chosenPub = selectedPub;
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
  font-size: 2rem;
  }

#goto button{
    font-size: 4rem;
    font-family: 'Galindo';
    background-color: rgb(65, 105, 225);
    cursor:pointer;
  }

#goto button:hover{
    color:white;
  }
</style>