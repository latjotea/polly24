<template>
    <body>
        <h2>{{ uiLabels.pickAmountTeam }}</h2>

        <div>
            <p>{{ amountTeams }}</p>
            <div id="amount"> <!-- Lägg till id på containern -->
                <button v-on:click="decreaseTeam">-</button>
                <button v-on:click="increaseTeam">+</button>
            </div>
        </div>

        <div>
            <button v-on:click="submitSelection" v-bind:disabled="amountTeams === 0" id="done">
                {{ this.uiLabels.sendPubs }}
            </button> 
        </div>


    </body>
</template>

<script>
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default{
    name:"CreateTeamView",

data: function () {
return {
    amountTeams: 0,
    uiLabels: {},
    }
},


created: function () {
this.pollId = this.$route.params.id;
socket.on( "uiLabels", labels => this.uiLabels = labels );
socket.emit( "getUILabels", this.lang );

},

methods: {
    // Ökar antalet lag upp till max 5
    increaseTeam() {
      if (this.amountTeams < 5) { // Kontroll för maxgräns
        this.amountTeams += 1; // Ökar värdet med 1
        this.$emit("teamUpdate", { amount: this.amountTeams }); // Skickar ändrat värde
      }
    },

    // Minskar antalet lag ner till minst 0
    decreaseTeam() {
      if (this.amountTeams > 0) { // Kontroll för mingräns
        this.amountTeams -= 1; // Minskar värdet med 1
        this.$emit("teamUpdate", { amount: this.amountTeams }); // Skickar ändrat värde
      }
    },
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