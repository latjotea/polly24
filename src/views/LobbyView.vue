<template>
  <body>
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
          <button v-on:click="participateInCrawl" class="green-button">
            {{ this.uiLabels.participateInCrawl }}
          </button>
        </div>
        <div v-if="userNameTaken" class ="invalid">
          <p>{{ this.uiLabels.userNameTaken }}</p>
        </div>
      </div>
      <div v-if="joined && !shuffleStarted" >
        <p>{{uiLabels.waitHost}}</p>
      </div>
      <div v-if="(joined || admin) && !shuffleStarted" v-for="person in participants" :key="person.name">
        {{ person.name }} 
        </div>

      <div>
        <button v-if="admin && !shuffleStarted" v-on:click="shuffleTeam()" v-bind:disabled="checkParticipantAmount()" class="green-button">
          {{ this.uiLabels.shuffle }}
        </button>
        <div v-if="unableToShuffle" class ="invalid">
          <p>{{ this.uiLabels.unableToShuffle }}</p>
      </div>
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
        <button class="green-button" v-on:click="startButtonHandler">
          {{ this.uiLabels.start }}
        </button>

      </div>

    </div>
  </body>
</template>

<script>
import io from 'socket.io-client';
import { errorMessages } from 'vue/compiler-sfc';
const socket = io(sessionStorage.getItem("dataServer"));

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
      unableToShuffle: false,
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
    socket.emit( "joinCrawl", this.crawlId );
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

    checkParticipantAmount: function(){
       const amountParticipants = this.participants.length-1 //Admin är inte med
       this.unableToShuffle = amountParticipants < this.teamAmount;
          return this.unableToShuffle
  
    },

    participateInCrawl: function () {
      for (let person of this.participants){
        if (person.name === this.userName) {
          console.log("User is already participating in the poll.");
          this.userNameTaken = true;
          return;
      }
    }
      socket.emit( "participateInCrawl", {crawlId: this.crawlId, name: this.userName, team:'', arrived: false, admin: false} )
      this.joined = true;
      this.userNameTaken = false;
    },

    shuffleTeam: function () {
      const adminParticipant=this.participants.find(p => p.name === 'Admin');
      const otherParticipants = this.participants.filter(p => p.name !== 'Admin');
      //BLANDA DELTAGARNA MED FISHER YATES CHAT HJÄLPTE OSS MED DENNA RAD
      const shuffledParticipants = [...otherParticipants].sort(() => Math.random() - 0.5);
      //SKAPAR ARRAYS FÖR ANTAL LAG
      this.teams = Array.from({ length: this.teamAmount }, () => []);

      if (adminParticipant){
        adminParticipant.team=1;
        this.teams[0].push(adminParticipant)

      }
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


    },

    startButtonHandler: function(){
      if (this.admin === true)
    {
      this.$router.push(`/interactivemap/${this.crawlId}/${this.adminId}/`);
      socket.emit("goToNextPub", this.crawlId)
    }


    },

  }
}
</script>

<style scoped>
body{
  margin-top: 12rem;
  }

input{
    font-size: 1.5rem;
  }

div {
  font-size: 1.7rem;
  font-family: 'Galindo';
  }

#crawlInfo {
    color: rgb(65, 105, 225)
  }

ul {
    list-style-type: none; 
    padding: 0; 
    margin: 0; 
  }

.team-container {
    border: 3px solid rgb(53, 90, 199); 
    border-radius: 20px; 
    padding: 10px; 
    margin: 20px auto; 
    max-width: 80%; 
    background-color: rgb(65, 105, 225);
  }



  
</style>