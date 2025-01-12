<template>
    <body>
        <h2>{{ this.uiLabels.pickAmountTeam }}</h2>
        <div>
            <p>{{ teamAmount }}</p>
            <div id="amount"> 
                <button v-on:click="decreaseTeam">-</button>
                <button v-on:click="increaseTeam">+</button>
            </div>
        </div>

        <div>
            <button v-on:click="sendTeamAmount(teamAmount)" v-bind:disabled="teamAmount === 0" id="done">
                {{ this.uiLabels.sendPubs }}
            </button> 
        </div>
    </body>
</template>

<script>
import io from 'socket.io-client';
const socket = io(sessionStorage.getItem("dataServer"));

export default{
    name:"CreateTeamView",

data: function () {
return {
    teamAmount: 0,
    uiLabels: {},
    lang: localStorage.getItem("lang") || "en",
    }
},


created: function () {
this.crawlId = this.$route.params.id;
socket.on( "uiLabels", labels => this.uiLabels = labels );
socket.emit( "getUILabels", this.lang );

},

methods: {
    // Ökar antalet lag upp till max 5
    increaseTeam() {
      if (this.teamAmount < 5) { // Kontroll för maxgräns
        this.teamAmount += 1; // Ökar värdet med 1
        this.$emit("teamUpdate", { amount: this.teamAmount }); // Skickar ändrat värde
      }
    },

    // Minskar antalet lag ner till minst 0
    decreaseTeam() {
      if (this.teamAmount > 0) { // Kontroll för mingräns
        this.teamAmount -= 1; // Minskar värdet med 1
        this.$emit("teamUpdate", { amount: this.teamAmount }); // Skickar ändrat värde
      }
    },

    sendTeamAmount(teamAmount){
      this.amount=teamAmount;
      socket.emit("setTeamAmount", {crawlId: this.crawlId, teamAmount:this.amount })
      this.$router.push(`/${this.crawlId}/mode/`);  
    }

  },
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

#amount button{
    font-size: 3rem;
    align-items: center;
    padding-bottom: 1rem;
    margin: 1rem;
    font-family: 'Galindo';
    background-color: rgb(65, 105, 225);
    cursor:pointer;
    max-height: 4rem;
    width: 4rem; 
    justify-content: center; 
    align-items: center;
  }

 #amount button:hover{
    color:white;
  }

 #done {
    margin-top:3rem;
    font-size: 2rem;
    font-family: 'Galindo';
    background-color: rgb(141, 242, 141);
    cursor:pointer;
    
  }

</style>