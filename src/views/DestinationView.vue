<template>
    <body>
      <h1 v-if="chosenPub && !crawlOver" >{{ uiLabels.goTo }} {{ chosenPub }}</h1>
      <div v-if="!crawlOver" id="goto"> 
        <button v-on:click="teamIsHere"> 
          {{ uiLabels.imHere }}
        </button>
      </div>
      <div v-if="crawlOver" >
        <h1>Pubrundan är slut!</h1>
        <h2>Vinnande laget är:</h2>
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
      round: 1,
      teamNumber: '',
      crawlOver: false
    }
  },
  created: function () {
    this.crawlId = this.$route.params.id;
    this.teamNumber = this.$route.params.team;
    console.log("jag är i lag:", this.teamNumber)
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );


    socket.on("currentRoundResponse", (round) => {
    this.round = round; 
    //console.log("runda:", this.round);
    });
    socket.emit("getRound", { crawlId: this.crawlId });
    socket.emit("joinPoll", this.crawlId);
    socket.emit("joinPoll", this.teamNumber);
    console.log("jag är i lag:", this.teamNumber)
    socket.on("selectedPubsResponse", (selectedPubs) => {
      this.selectedPubs = selectedPubs;
      //console.log("Hämtade pubar från servern:", this.selectedPubs); 
      //console.log(this.selectedPubs.length)
      this.isCrawlOver();
      this.choosePub();
    });
    socket.emit("getSelectedPubs", {crawlId: this.crawlId });
    socket.on("goToMap", () => {
      this.$router.push(`/interactivemap/${this.crawlId}/${this.teamNumber}`) 
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
    },

    isCrawlOver() {
      console.log(this.selectedPubs.length);
      console.log(this.round);
      if (this.round > this.selectedPubs.length) {
        this.crawlOver = true
        this.$router.push(`/result/${this.crawlId}`);
    
      }

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