<template>
    <body>
      <h1 v-if="chosenPub">{{ uiLabels.goTo }} {{ chosenPub }}</h1>

      <div id="goto"> 
        <button v-on:click="teamIsHere"> 
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
      chosenPub: null,
      selectedPubs: [],
      rounds:0
    }
  },
  created: function () {
    this.crawlId = this.$route.params.id;
    this.teamNumber = this.$route.params.team;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
    socket.emit("getSelectedPubs", {crawlId: this.crawlId });

    socket.on("selectedPubsResponse", (selectedPubs) => {
      this.selectedPubs = selectedPubs;
      console.log("Hämtade pubar från servern:", this.selectedPubs); 
      this.choosePub();
      console.log("Antalet rundor",this.rounds)
      console.log(this.selectedPubs.length)

    });

    socket.on("getRoundsUpdate", rounds => {
      this.rounds = rounds;
    });

    socket.on("teamArrived", () => {
      this.$router.push(`/interactivemap/${this.crawlId}/${this.teamNumber}`) //Interaktiv karta finns inte än
    });

  },

  

  methods: {
    choosePub(){
      const totalPubs = this.selectedPubs.length;
      const adjustedTeamNumber = this.teamNumber - 1;
      const chosenPubIndex = (adjustedTeamNumber + this.rounds) % totalPubs;
      this.chosenPub = this.selectedPubs[chosenPubIndex];
   

    },

    teamIsHere(){
      socket.emit('teamArrived',{crawlId:this.crawlId, chosenPub:this.chosenPub, teamNumber:this.teamNumber})
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