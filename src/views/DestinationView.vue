<template>
    <body>
      <div class="destination-container">
        <h1 v-if="chosenPub && !crawlOver" class="destination-header">
          {{ uiLabels.goTo }} {{ chosenPub }} 
        </h1>

        <div v-if="!crawlOver"> 
          <button v-on:click="teamIsHere" class="blue-button"> 
            {{ uiLabels.imHere }}
          </button>
        </div>

        <div v-if="crawlOver" >
          <h1>Pubrundan är slut!</h1>
          <h2>Vinnande laget är:</h2>
        </div>
      </div>

    </body>
</template>


<script>
import io from 'socket.io-client';
const socket = io(sessionStorage.getItem("dataServer"));


export default{
    name:"DestinationView",
    
data: function () {
    return {
      uiLabels: {},
      chosenPub: null,
      selectedPubs: [],
      round: 1,
      teamNumber: '',
      crawlOver: false,
      lang: localStorage.getItem( "lang") || "en"
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
    socket.emit("joinCrawl", this.crawlId);
    socket.emit("joinCrawl", this.teamNumber);
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
      socket.emit("getRound", {crawlId: this.crawlId});
      socket.emit("getSelectedPubs", {crawlId: this.crawlId});
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
        this.$router.push(`/result/${this.crawlId}/${this.teamNumber}`);
    
      }

    }
  }

}
</script>


<style scoped>
body{
  margin-top: 12rem;
  font-family: 'Galindo';
  height: 100vh;
  font-size: 2rem;
  }

.destination-container {
  text-align: center;
}

.destination-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.blue-button{
    font-size: 4rem;
  }


  @media screen and (max-width: 600px) {
  .destination-container {
    width: 90%;
    height: 500px;
    margin: 1rem;
  }

  .destination-header {
    font-size: 3rem;
  }

  .blue-button{
    font-size: 3rem;
  }


}
</style>