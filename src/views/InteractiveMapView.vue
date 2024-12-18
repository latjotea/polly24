

<template>
    <body>    
     <div class="interactive-container">
         <img v-if="selectedMap" :src="selectedMap.picture" class="city-map"/>
         <div 
             v-for="pub in selectedPubs" 
             :key="pub.name" 
             class="marker-container" 
             :style="{ top: pub.coordinates.y + 'px', left: pub.coordinates.x + 'px' }">
           <div class="marker"></div>
           <div class="pub-label">{{ pub.name }}</div>
       </div>
     </div>

     <button v-if="!admin" v-on:click="navigateToTaskView" id="taskButton">
            {{ uiLabels.seeTasks }}
        </button>
        <button v-if="admin" v-on:click="navigateToAdminControlView" id="controlButton">
            {{ uiLabels.controlCrawl }}
        </button>
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
       //pubList: [],
       allMaps: maps,
       selectedMap: null,
       adminOrTeamId: "",
       admin: false,
       adminId: "",
       teamNumber: ''
     }
   },
   created: function () {
    this.crawlId = this.$route.params.id;
    this.adminOrTeamId = this.$route.params.adminOrTeamId;
    this.adminOrTeam();
     this.crawlId = this.$route.params.id;
     socket.on( "uiLabels", labels => this.uiLabels = labels );
     socket.emit( "getUILabels", this.lang );
     socket.emit("getCity", {crawlId: this.crawlId });
     socket.emit("getSelectedPubs", {crawlId: this.crawlId });
     socket.emit( "participateInPoll", {crawlId: this.crawlId, name: "Admin", team:'', arrived: false, admin:true} );
     
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
 
 </style>
 
 