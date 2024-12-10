
<template>
  <div>
    <div v-if="!shuffle" id="crawlInfo">
      <span>{{this.uiLabels.crawlID}}</span> {{ crawlId }}
    </div>
    <div v-if="!joined">
      <label>
        {{this.uiLabels.writeName}}
      </label>
      <div id="addName">
        <input type="text" v-model="userName">
        <button v-on:click="participateInPoll">
          {{ this.uiLabels.participateInPoll }}
        </button>
      </div>
    </div>
    <div v-if="joined && !shuffle">
      <p>Waiting for host to start poll</p>
      <div v-for="person in participants" :key="person.name">
       {{ person.name }} 
      </div>
    </div>

    <div>
      <button v-if="joined && !shuffle" v-on:click="shuffleTeam" id="shuffle">
        {{ this.uiLabels.shuffle }}
      </button>
    </div>

    <div v-if="shuffle">
      <h3>{{this.uiLabels.teamDivision}}</h3>
      <div v-for="(team, index) in teams" :key="index" class="team-container">
        <h4>{{ this.uiLabels.team }} {{ index + 1 }}</h4>
        <ul>
          <li v-for="member in team" :key="member.name">{{ member.name }}</li>
        </ul>
      </div>
    </div>

    <div v-if="shuffle">
      <button id="start">
        {{ this.uiLabels.start }}
      </button>

    </div>

  </div>
</template>

<script>
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'LobbyView',
  data: function () {
    return {
      userName: "",
      crawlId: "inactive poll",
      uiLabels: {},
      joined: false,
      lang: localStorage.getItem("lang") || "en",
      participants: [],
      teams: [],
      teamAmount: '',
      shuffle:false,
    }
  },
  created: function () {
    this.crawlId = this.$route.params.id;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
    socket.on( "participantsUpdate", p => this.participants = p );
    socket.on( "startPoll", () => this.$router.push("/poll/" + this.crawlId) );
    socket.emit( "joinPoll", this.crawlId );
    socket.emit("getTeamAmount", {crawlId: this.crawlId });

    socket.on("selectedTeamAmountResponse", (teamAmount) => {
    this.teamAmount = teamAmount; 
    console.log("Antalet lag är:", this.teamAmount); 

  });

    
  },
  methods: {
    participateInPoll: function () {
      socket.emit( "participateInPoll", {crawlId: this.crawlId, name: this.userName} )
      this.joined = true;
    },

    //OBS finns fel med metoden - ex. går det ej att slumpa lag om endast en person är med - men kanske ej gör något

    //Metod tagen från chatgpt - Använd Fisher-Yates-algoritmen för att slumpa ordningen på deltagarna
    
    shuffleTeam: function () {
    // Blanda deltagarna och fördela i lag
      this.teams = [...this.participants]
        .sort(() => Math.random() - 0.5) // Blanda med sort och en slumpmässig faktor
        .reduce((teams, participant, index) => {
          teams[index % this.teamAmount].push(participant); // Fördela deltagarna jämnt
          return teams;
        }, 
      Array.from({ length: this.teamAmount }, () => [])); // Skapa tomma lag

      this.shuffle = true; 
    },

  }
}
</script>

<style>
body{
  margin-top: 12rem;
  background-color:rgb(255, 240, 245);
  font-family: 'Galindo';
  height: 100vh;
  }
  div {
  font-size: 1.7rem;
  font-family: 'Galindo';
  }
  #crawlInfo {
    color: rgb(65, 105, 225)
  }
  button {
    font-size: 2rem;
    font-family: 'Galindo';
    background-color: rgb(65, 105, 225);
    cursor:pointer;
  }
  button:hover{
    color:white;
  }
  input{
    font-size:2rem;
    font-family: 'Galindo';
  }

  ul {
    list-style-type: none; 
    padding: 0; 
    margin: 0; 
  }

  .team-container {
    border: 3px solid rgb(53, 90, 199); 
    border-radius: 20px; /* Rundade hörn */
    padding: 10px; /* Inre marginal */
    margin: 20px auto; /* Yttre marginal, centrering med auto */
    max-width: 80%; /* Maximal bredd för ramen */
    background-color: rgb(65, 105, 225);; /* Bakgrundsfärg */
  }

  #shuffle {
    margin-top: 3vh;
  }

  #start {
    background-color: rgb(141, 242, 141);
  }
  
  /* Kvar att fixa: Spara lagen som skapas och skicka på socket */
  
</style>


