<template>
  <div>
    <div v-if="!shuffleStarted" id="crawlInfo" >
      <span>{{this.uiLabels.crawlID}}</span> {{ crawlId }}
    </div>
    <div v-if="!joined && !admin" >
      <label>
        {{this.uiLabels.writeName}}
      </label>
      <div id="addName">
        <input type="text" v-model="userName">
        <button v-on:click="participateInPoll">
          {{ this.uiLabels.participateInPoll }}
        </button>
      </div>
      <div v-if="userNameTaken" id ="takenUserName">
        <p>{{ this.uiLabels.userNameTaken }}</p>
      </div>
    </div>
    <div v-if="(joined || admin) && !shuffleStarted" >
      <p>Waiting for host to start poll</p>
      <div v-for="person in participants" :key="person.name">
       {{ person.name }} 
      </div>
    </div>

    <div>
      <button v-if="admin && !shuffleStarted" v-on:click="shuffleTeam" id="shuffle">
        {{ this.uiLabels.shuffle }}
      </button>
    </div>

    <div v-if="shuffleStarted">
      <h3>{{this.uiLabels.teamDivision}}</h3>
      <div v-for="(team, index) in teams" :key="index" class="team-container">
        <h4>{{ this.uiLabels.team }} {{ index + 1 }}</h4>
        <ul>
          <li v-for="member in team" :key="member.name">{{ member.name }}</li>
        </ul>
      </div>
    </div>

    <div v-if="shuffleStarted && admin">
      <button id="start" v-on:click="startButtonHandler">
        {{ this.uiLabels.start }}
      </button>

    </div>

  </div>
</template>

<script>
import io from 'socket.io-client';
import { errorMessages } from 'vue/compiler-sfc';
const socket = io("localhost:3000");

export default {
  name: 'LobbyView',
  data: function () {
    return {
      userName: "",
      userNameTaken: false,
      crawlId: "inactive poll",
      adminId: "not_admin",
      admin: false,
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      participants: [],
      teams: [],
      teamAmount: '',
      teamNumber:'',
      shuffleStarted:false,
      joined: false,
    }
  },
  created: function () {
    this.crawlId = this.$route.params.id;
    this.adminId = this.$route.params.adminId;
    this.isAdmin();

    socket.on("receivedShuffleStarted", (data) => {
      this.teams = data.teams; 
      this.shuffleStarted = true;
      this.participants=data.participants;
      const currentParticipant = this.participants.find((participant) => participant.name === this.userName);
      this.teamNumber = currentParticipant.team;
      console.log("Jag är i lag:", this.teamNumber)
    });

    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
    socket.on( "participantsUpdate", p => this.participants = p); 
    socket.on( "startPoll", () => this.$router.push("/poll/" + this.crawlId) );
    socket.emit( "joinPoll", this.crawlId );
    socket.emit("getTeamAmount", {crawlId: this.crawlId });
    socket.on("selectedTeamAmountResponse", (teamAmount) => {
      this.teamAmount = teamAmount; 
      console.log("Antalet lag är:", this.teamAmount);
    });
    socket.on('goToNextPub', () => {
      if (!this.admin){this.$router.push(`/Destination/${this.crawlId}/${this.teamNumber}`)}});
    
  

    
  },
  methods: {
    isAdmin: function() {
      if (this.adminId && this.adminId.length > 10) {
        this.admin = true;
      }
      console.log(this.admin)
    },

    participateInPoll: function () {
      for (let person of this.participants){
        if (person.name === this.userName) {
          console.log("User is already participating in the poll.");
          this.userNameTaken = true;
          return;
      }
    }
      socket.emit( "participateInPoll", {crawlId: this.crawlId, name: this.userName, team:'', arrived: false, admin: false} )
      this.joined = true;
      this.userNameTaken = false;
    },

    shuffleTeam: function () {
      //BLANDA DELTAGARNA MED FISHER YATES CHAT HJÄLPTE OSS MED DENNA RAD
      const shuffledParticipants = [...this.participants].sort(() => Math.random() - 0.5);
      //SKAPAR ARRAYS FÖR ANTAL LAG
      this.teams = Array.from({ length: this.teamAmount }, () => []);
      shuffledParticipants.forEach((participant, index) => {
        const teamIndex = index % this.teamAmount; // Beräkna team-index
        participant.team = teamIndex + 1; // Tilldela team (1-baserat)
        this.teams[teamIndex].push(participant);
        console.log(participant.name, "tilldelas lag", teamIndex + 1);
      });
      console.log("Lagen är färdiga:", this.teams);
      this.shuffleStarted = true;
      // Uppdatera participants med team-index
      this.participants = shuffledParticipants;
      console.log("Uppdaterad participants med team:", this.participants);

      socket.emit("shuffleStarted", { crawlId: this.crawlId, teams: this.teams, participants:this.participants});

      console.log("Skickar lagen och deltagarlistan till servern.");
    },

    startButtonHandler: function(){
      if (this.admin === true)
    {
      this.$router.push(`/admincontrol/${this.crawlId}`);
      socket.emit("goToNextPub", this.crawlId)
    }


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
  
  #takenUserName {
    color: red
  }
  
</style>