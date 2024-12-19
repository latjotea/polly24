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
      round: 0,
      teamNumber: ''
    }
  },
  created: function () {
    this.crawlId = this.$route.params.id;
    this.teamNumber = this.$route.params.team;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );


    socket.on("currentRoundResponse", (round) => {
    this.round = round; 
    console.log("runda:", this.round);
    });
    socket.emit("getRound", { crawlId: this.crawlId });
    socket.emit("joinPoll", this.crawlId);
    socket.emit("joinPoll", this.teamNumber);
    socket.on("selectedPubsResponse", (selectedPubs) => {
      this.selectedPubs = selectedPubs;
      console.log("Hämtade pubar från servern:", this.selectedPubs); 
      console.log("Antalet rundor",this.round)
      console.log(this.selectedPubs.length)
      this.choosePub();
    });
    socket.emit("getSelectedPubs", {crawlId: this.crawlId });

    socket.on("goToMap", () => {
      this.$router.push(`/interactivemap/${this.crawlId}/${this.teamNumber}`) //Interaktiv karta finns inte än
    });

    socket.on('goToNextPub', () => {
      window.location.reload()
    });


  },

  

  methods: {
    choosePub(){
      const totalPubs = this.selectedPubs.length;
      const adjustedTeamNumber = this.teamNumber - 1;
      const chosenPubIndex = (adjustedTeamNumber + this.round) % totalPubs;
      this.chosenPub = this.selectedPubs[chosenPubIndex];
      console.log(this.chosenPub)

    },

    teamIsHere(){
      socket.emit('teamArrived',{crawlId:this.crawlId, teamNumber:this.teamNumber, chosenPub: this.chosenPub})
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