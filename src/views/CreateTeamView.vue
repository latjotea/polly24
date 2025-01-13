<template>
    <body>
        <h2 id="teamAmount">{{ this.uiLabels.pickAmountTeam }}</h2>
        <div>
            <p id="teamAmount">{{ teamAmount }}</p>
            <div id="amount"> 
                <button class="blue-button" v-on:click="decreaseTeam">-</button>
                <button class="blue-button" v-on:click="increaseTeam">+</button>
            </div>
        </div>

        <div>
            <button v-on:click="sendTeamAmount(teamAmount)" v-bind:disabled="teamAmount === 0" class="green-button" id="done">
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

<style scoped>
body{
  margin-top: 12rem;
  }

#amount button{
    font-size: 3rem;
    margin: 1rem;
    padding:2rem
  }

#done{
  margin-top: 2rem;
  font-size:2.5rem;
}

#teamAmount{
  font-size: 2.5rem;

}



</style>