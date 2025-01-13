

<template>
    <body> 
      <div class="header-text">
        
        <div class="info-container">
          <div v-if="admin && !crawlOver" class="admin-header">
          <span> {{uiLabels.yourRound}} {{ round }} </span>
          <button v-on:click="goToCreateTask" class="blue-button">{{this.uiLabels.handleTasks}} </button>
          <button v-on:click="sendToNextPub" class="blue-button"> {{this.uiLabels.nextStop}} </button>
        </div>
        <div v-else class="user-header">
              <span>{{ uiLabels.yourRound }} {{ round }} : {{ getCurrentTeamPub() }}</span>
              <button v-if="!admin" v-on:click="navigateToTaskView" class="blue-button">
                {{ uiLabels.seeTasks }}
              </button>
            </div>
          </div>
        </div>
     
      <div class="map-container">
         <img v-if="selectedMap" :src="selectedMap.picture" class="city-map"/>
         <div 
             v-for="pub in selectedPubs" 
             :key="pub.name" 
             class="marker-container" 
             :style="{ top: pub.coordinates.y + 'px', left: pub.coordinates.x + 'px' }">
           <div class="marker"
              :class="{chosen:isChosenPub(pub.name)}">
            </div>
            <div
              v-if="isCurrentTeamPub(pub.name)" 
              class="chosenPub-label your-position">
                {{ uiLabels.yourPosition }}
            </div>
            <div 
              v-for="chosen in getOtherTeamsAtPub(pub.name)" 
              :key="chosen.teamNumber"   
              class="chosenPub-label other-team">
                {{ uiLabels.team }}{{ chosen.teamNumber }} {{ uiLabels.isAt }}
            </div>
           <div class="pub-label">{{ pub.name }}</div>   
       </div>
   
      <button @click="toggleScoreboard" class="green-button">
        {{ uiLabels.seePoints }}
      </button>

 
      <div v-if="isScoreboardVisible" class="scoreboard">
      <p>{{ uiLabels.points }}</p>
      <ul>
        <li v-for="(score, index) in scores" :key="index">
          {{ uiLabels.team }} {{ index + 1 }}: {{ score }} p
        </li>
      </ul>
      <button @click="toggleScoreboard" class="blue-button">
        {{ uiLabels.close }}
      </button>
    </div>
  </div>
        
    </body>
 </template>
 
 <script>
 import io from 'socket.io-client';
 import pubs from '/server/data/Pubs.json';
 import maps from '/server/data/Maps.json';
 
 const socket = io(sessionStorage.getItem("dataServer"));
 
 
 export default {
   name: 'InteractiveMapView',
   data: function () {
     return {
       uiLabels: {},
       lang: localStorage.getItem("lang") || "en",
       city:"",
       allPubs: pubs,
       selectedPubs: [],
       allMaps: maps,
       selectedMap: null,
       adminOrTeamId: "",
       admin: false,
       adminId: "",
       teamNumber: '',
       round: 0,
       chosenPubs:[],
       currentPub:'',
       isScoreboardVisible: false,
       scores: [],
       teamAmount:"",
       crawlOver:false,
       pubsLoaded:false
     }
   },
   created: function () {
    this.crawlId = this.$route.params.id;
    this.adminOrTeamId = this.$route.params.adminOrTeamId;
    this.adminOrTeam();

    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on("currentRoundResponse", (round) => {
      this.round = round; 
      if (this.pubsLoaded){
        this.isCrawlOver();
      }
      console.log("runda:", this.round);
    });

    socket.on("selectedCityResponse", (city) => {
       console.log("Given city:", city);
       this.city = city;
       this.selectMapPicture(city);
     });

     socket.on("selectedPubsResponse", (selectedPubNames) => {
         this.selectedPubs = this.allPubs.filter(pub =>
             selectedPubNames.includes(pub.name)
         );
         this.pubsLoaded= true;
         if (this.admin){
          this.isCrawlOver();
         }
     });
    socket.on('goToNextPub', () => {
      if (!this.admin){
        this.$router.push(`/Destination/${this.crawlId}/${this.teamNumber}`)}});
    
    socket.on("currentChosenPubsResponse", (chosenPubs) => {
      this.chosenPubs = chosenPubs; 
      console.log("Valda pubar:", this.chosenPubs);
    });

    socket.on("scoresUpdated", (scores) => {
      this.scores=scores.slice(0,this.teamAmount);
    });

    socket.on("selectedTeamAmountResponse", (teamAmount) => {
      this.teamAmount = teamAmount;
    });


    socket.emit( "getUILabels", this.lang );
    socket.emit( "joinCrawl", this.crawlId );
    socket.emit("getCity", {crawlId: this.crawlId });
    socket.emit("getRound", { crawlId: this.crawlId });
    socket.emit("getSelectedPubs", {crawlId: this.crawlId });
    socket.emit("getTeamAmount", { crawlId: this.crawlId });
    
    if (this.admin){
      socket.emit( "participateInCrawl", {crawlId: this.crawlId, name: "Admin", team:'', arrived: false, admin:true} );
    }
    else{
      socket.emit("participateInCrawl", {crawlId:this.crawlId, name:'', team:this.teamNumber, arrived:false, admin:false});
    }
    socket.emit("getChosenPubs", {crawlId: this.crawlId});
   },

   methods: {
    getCurrentTeamPub() {
      const currentPub=this.chosenPubs.find(pub => pub.teamNumber === this.teamNumber);
      return currentPub ? currentPub.chosenPub: '';
    },

    isChosenPub(pubName) {
      return this.chosenPubs.some(chosen => chosen.chosenPub === pubName);
    },

    isCurrentTeamPub(pubName) {
      return this.chosenPubs.some(chosen => 
        chosen.teamNumber === this.teamNumber && 
        chosen.chosenPub === pubName
      );
    },

    getOtherTeamsAtPub(pubName) {
      return this.chosenPubs.filter(chosen => 
        chosen.chosenPub === pubName && 
        chosen.teamNumber !== this.teamNumber
      );
    },


    toggleScoreboard() {
    this.isScoreboardVisible = !this.isScoreboardVisible;
    if (this.isScoreboardVisible) {
      socket.emit("getScores", { crawlId: this.crawlId });
    }
    },

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

     selectMapPicture(city) {
       // Välj kart bild baserat på stad
       const map = this.allMaps.find(map => map.city === city);
       console.log("Selected map:", map)
       this.selectedMap=map;
     },

     navigateToTaskView(){
        this.$router.push(`/task/${this.crawlId}/${this.teamNumber}`);
 
    },
    goToCreateTask: function () {
      this.$router.push(`/task/${this.crawlId}/${this.adminId}/`);
    },

    sendToNextPub: function() {
      if (confirm(this.uiLabels.confirmSendToNext)){
        socket.emit("goToNextPub", this.crawlId);
        socket.emit("updateRound", { crawlId: this.crawlId });
        socket.emit("getRound", { crawlId: this.crawlId });
      }
    },

    isCrawlOver() {
      if (!this.pubsLoaded || this.selectedPubs.length === 0){
        return;
      }
      console.log(this.selectedPubs.length);
      console.log(this.round);
      if (this.round > this.selectedPubs.length) {
        this.crawlOver = true
        this.$router.push(`/result/${this.crawlId}/${this.adminId}/`);
      }
    }
  }
}

 </script>
 
 <style scoped>
  .header-text {
  position: static;
  transform: none;
  font-size: 2rem;
  width: 100%;
  text-align: center;
  margin-bottom: 1rem;
}

  .admin-header{
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .user-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.user-header span {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}
  
  .map-container {
  position: relative;
  margin: 0 auto;
  width: 1000px;
  height: 700px;
  overflow: scroll;
  border: 5px solid hotpink;
  margin-bottom: 1rem;

}

.blue-button{
  color: black
}

   .city-map {
   width: 1356px;
   height: 1736px; 
 }

  /*CHAT FÖR ATT GÖRA EN PRICK*/
 .marker-container {
   position: absolute;
   transform: translate(-50%, -50%); /* Centrerar markeringen runt koordinaten */
   text-align: center;
   z-index: 2; /* Placera ovanpå kartan */
 }
 
 .marker {
   width: 15px;
   height: 15px;
   background-color: white;
   border: 2px solid black;
   border-radius: 50%;
  
 }
 
 .pub-label{
   display: block; 
   color: white; 
   text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8); 
 }

  .chosenPub-label {
    display: block;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

  .your-position {
    color: rgb(76, 245, 76);
    order: 1;
}

  .other-team {
    color: rgb(255, 89, 0);
    order: 2; 
}
 
 


 .green-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  font-size: 1.5rem;
  padding: 10px 20px;
  z-index: 20;
}

.info-container{
    align-items: center;
    flex-direction: column;
    display: flex;
    margin-top: 1rem;
    gap: 0.5rem;
  }


.scoreboard {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: hotpink;
  color: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 10;
  font-family: 'Galindo';
  min-width: 200px;
}

.scoreboard li {
  font-size: 1.5rem;
  margin: 0.5rem 0;
}

.pub-label {
  order: 1; 
}

@media screen and (max-width: 600px) {
  .map-container {
    width: 90%;
    height: 500px;
    margin: 1rem;
  }

  .info-container{
    align-items: center;
    justify-content: center;
    display: flex;
    margin-top: 1rem;
    gap:0.5rem
  }


  .city-map {
    width: 1356px;
    height: 1736px;
  }

  .selectedPubs-text {
    font-size: 1.7rem;
  }
}




 
 </style>
 
 