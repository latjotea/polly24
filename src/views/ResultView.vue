<template>
  <body>
    <div class="final-container">
      <h1>{{ uiLabels.crawlEnd }}</h1>
      <h2 v-if="!admin && teamNumber" class="placement-text">
        {{uiLabels.teamPlace}} {{ getTeamPlace }}
      </h2>
      
      <div class="podium-container">
        <!-- Silver - Second Place -->
        <div class="podium-item silver" v-if="sortedTeams.length > 1 && teamAmount > 1">
          <div class="team-info">
            <div class="medal">🥈</div>
            <div class="team-name">{{uiLabels.team}} {{ sortedTeams[1].teamNumber }}</div>
            <div class="team-score">{{ sortedTeams[1].score }} {{uiLabels.teamPoints}}</div>
          </div>
          <div class="podium-block second"></div>
        </div>

        <div class="podium-item gold" v-if="sortedTeams.length > 0 && teamAmount > 0">
          <div class="team-info">
            <div class="medal">🥇</div>
            <div class="team-name">{{uiLabels.team}} {{ sortedTeams[0].teamNumber }}</div>
            <div class="team-score">{{ sortedTeams[0].score }} {{uiLabels.teamPoints}}</div>
          </div>
          <div class="podium-block first"></div>
        </div>
        
        <div class="podium-item bronze" v-if="sortedTeams.length > 2 && teamAmount > 2">
          <div class="team-info">
            <div class="medal">🥉</div>
            <div class="team-name">{{uiLabels.team}} {{ sortedTeams[2].teamNumber }}</div>
            <div class="team-score">{{ sortedTeams[2].score }} {{uiLabels.teamPoints}}</div>
          </div>
          <div class="podium-block third"></div>
        </div>
      </div>
      

      <div class="other-teams" v-if="sortedTeams.length > 3 && teamAmount > 3">
        <h3>{{ uiLabels.loserTeams }}</h3>
        <div v-for="(team, index) in sortedTeams.slice(3)" :key="index" class="other-team">
          <span class="place">{{ index + 4 }}.</span>
          <span>{{uiLabels.team}} {{ team.teamNumber }} - {{ team.score }} {{ uiLabels.teamPoints }}</span>
        </div>
      </div>
    </div>
    <button v-if="admin" v-on:click="handleEndButton()">
      {{ uiLabels.endCrawl }}
    </button>
  </body>
</template>

<script>
import io from 'socket.io-client';
const socket = io(sessionStorage.getItem("dataserver"));

export default {
  name: 'ResultView',
  data() {
    return {
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      crawlId: '',
      adminId: "",
      scores: [],
      teamAmount:"",
      teamNumber:'',
      admin:false,
    }
  },
  
  computed: {
    sortedTeams() {
      const teamsWithScores = this.scores.map((score, index) => ({teamNumber: index + 1, score: score})
    );
      
      //AI
      return teamsWithScores.sort((a, b) => b.score - a.score).slice(0,this.teamAmount);
    },

    getTeamPlace(){
      return this.sortedTeams.findIndex(team => team.teamNumber === parseInt(this.teamNumber)) +1;
    }

  },

  created() {
    this.crawlId = this.$route.params.id;
    this.adminOrTeamId = this.$route.params.adminOrTeamId;
    this.adminOrTeam();
    socket.on("uiLabels", labels => this.uiLabels = labels);
    socket.emit( "getUILabels", this.lang );
    socket.emit( "joinCrawl", this.crawlId );

    socket.on("selectedTeamAmountResponse", (teamAmount) => {
      this.teamAmount = teamAmount; 
      console.log("Antalet lag är:", this.teamAmount);
    });

    socket.emit("getTeamAmount", {crawlId: this.crawlId });
    
    socket.emit('getScores', { crawlId: this.crawlId });
    
    socket.on('scoresUpdated', (scores) => {
      this.scores = scores.slice(0,this.teamAmount);
    });

    socket.on('crawlEnded', () => {
      this.$router.push(`/`)});
    
  },
  methods: {
    adminOrTeam() {
    if (this.adminOrTeamId.length > 10) {
        this.admin = true;
        this.adminId = this.adminOrTeamId;
      }
    else {
      this.teamNumber = this.adminOrTeamId;
    }
      console.log(this.admin)
    },
    handleEndButton(){
      socket.emit("endCrawl", {crawlId: this.crawlId });
      this.$router.push(`/`)
    }

  }
}
</script>

<style scoped>
body {
  margin-top: 1rem;
  background-color: rgb(255, 240, 245);
  font-family: 'Galindo';
  height: 100vh;
}

.final-container {
  text-align: center;
  padding: 2rem;
}

.placement-text{
  font-size: 1.5rem;
  color:rgb(65, 105, 225);
  margin:1rem;
}

.podium-container {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin: 4rem auto;
  gap: 1rem;
  height: 400px;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
}

.team-info {
  text-align: center;
  margin-bottom: 1rem;
}

.medal {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.team-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.team-score {
  font-size: 1.2rem;
}

.podium-block {
  width: 100%;
  border-radius: 8px 8px 0 0;
}

.first {
  height: 200px;
  background-color: #FFD700;
}

.second {
  height: 150px;
  background-color: #C0C0C0;
}

.third {
  height: 100px;
  background-color: #CD7F32;
}

.other-teams {
  margin-top: 3rem;
  text-align: center;
}

.other-team {
  margin: 0.5rem 0;
  font-size: 1.2rem;
}

.place {
  font-weight: bold;
  margin-right: 1rem;
}

h1 {
  color: rgb(65, 105, 225);
  margin-bottom: 2rem;
}

h3 {
  color: rgb(65, 105, 225);
  margin-bottom: 1rem;
}
</style>