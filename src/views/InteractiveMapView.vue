

<template>
    <body> 
      <p v-if="admin">{{ uiLabels.yourRound }} {{ round }}</p> 
      <p v-else>{{ uiLabels.yourRound }} {{ round }} : {{ getCurrentTeamPub() }}</p>
     <div class="interactive-container">
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
     </div>

     <button v-if="!admin" v-on:click="navigateToTaskView" id="taskButton">
            {{ uiLabels.seeTasks }}
        </button>
        <button v-if="admin" v-on:click="navigateToAdminControlView" id="controlButton">
            {{ uiLabels.controlCrawl }}
        </button>
   
    <button @click="toggleScoreboard" id="scoreboardButton">
      {{ uiLabels.seePoints }}
    </button>

 
    <div v-if="isScoreboardVisible" class="scoreboard">
    <p>{{ uiLabels.points }}</p>
    <ul>
      <li v-for="(score, index) in scores" :key="index">
        {{ uiLabels.team }} {{ index + 1 }}: {{ score }}
      </li>
    </ul>
    <button @click="toggleScoreboard" class="close-button">
      {{ uiLabels.close }}
    </button>
  </div>
        
    </body>
 </template>
 
 <script>
 import io from 'socket.io-client';
 import pubs from '/server/data/Pubs.json';
 import maps from '/server/data/Maps.json';
 
 const socket = io("localhost:3000");
 
 
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
       teamAmount:""
     }
   },
   created: function () {
    this.crawlId = this.$route.params.id;
    this.adminOrTeamId = this.$route.params.adminOrTeamId;
    this.adminOrTeam();
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on("currentRoundResponse", (round) => {
      this.round = round; 
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
     });
    socket.on('goToNextPub', () => {
      if (!this.admin){this.$router.push(`/Destination/${this.crawlId}/${this.teamNumber}`)}});
    
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
    socket.emit( "joinPoll", this.crawlId );
    socket.emit("getCity", {crawlId: this.crawlId });
    socket.emit("getRound", { crawlId: this.crawlId });
    socket.emit("getSelectedPubs", {crawlId: this.crawlId });
    socket.emit("getTeamAmount", { crawlId: this.crawlId });
    if (this.admin){
      socket.emit( "participateInPoll", {crawlId: this.crawlId, name: "Admin", team:'', arrived: false, admin:true} );
     }
    else{
      socket.emit("participateInPoll", {crawlId:this.crawlId, name:'', team:this.teamNumber, arrived:false, admin:false});
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
    navigateToAdminControlView(){
        this.$router.push(`/admincontrol/${this.crawlId}/${this.adminId}`);
 
 }
 }
}

 
 
 </script>
 
 <style>
 body{
   margin: 0; 
   padding: 2rem;
   justify-content: center; 
   align-items: center;
   background-color:rgb(255, 240, 245);
   font-family: 'Galindo';
   height: 100vh;
   position:relative;
   box-sizing: border-box;
   }
 
   .interactive-container {
     position: relative; 
     top: 0;
     left: 0;
     height: calc(100% - 4rem);
     overflow: scroll;
     font-family: 'Galindo';
     
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
   display: block; /* Se till att texten visas som en separat rad */
   color: white; /* Färgen för att synas på kartan */
   text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8); /* Lägg till skugga för bättre läsbarhet */
 }

 .chosenPub-label{
  color: rgb(76, 245, 76); ;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8); /* Lägg till skugga för bättre läsbarhet */
  display: block; /* Se till att texten visas som en separat rad */

 }
 
 #taskButton, #controlButton {
    top: 5rem;
    right: 5rem;
    position: fixed;
    font-size: 2rem;
    font-family: 'Galindo';
    background-color: hotpink;
    z-index: 3;
 }



button:hover {
    color: white;
 }


 #scoreboardButton {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  font-size: 1.5rem;
  background-color: #4caf50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
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

.close-button {
  display: block;
  margin: 1.5rem auto 0;
  padding: 0.5rem 1rem;
  font-family: 'Galindo';
  background-color: rgb(65, 105, 225);
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1.2rem;
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

.marker-container {
  position: absolute;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 2;
  display: flex;
  flex-direction: column;
}

.pub-label {
  order: 3; 
}



 
 </style>
 
 