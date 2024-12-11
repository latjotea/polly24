

<template>
   <div class="overlay-text">
        {{this.uiLabels.yourCrawl}} 
    </div>
    <div class="map-container">
        <img v-if="selectedMap" :src="selectedMap.picture" class="city-map"/>
        <div 
            v-for="pub in selectedPubs" 
            :key="pub.name" 
            class="marker-container" 
            :style="{ top: pub.coordinates.y + 'px', left: pub.coordinates.x + 'px' }"
        >
          <div class="marker"></div>
          <div class="pub-label">{{ pub.name }}</div>
      </div>
    </div>

    <div>
        <button class="create-button"> 
          {{this.uiLabels.createCrawl}}
        </button>
      </div>

</template>

<script>
import io from 'socket.io-client';
import pubs from '/server/data/Pubs.json';
import maps from '/server/data/Maps.json';

const socket = io("localhost:3000");


export default {
  name: 'MapView',
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
    }
  },
  created: function () {
    this.crawlId = this.$route.params.id;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
    socket.emit("getCity", {crawlId: this.crawlId });
    socket.emit("getSelectedPubs", {crawlId: this.crawlId });
    
    socket.on("selectedCityResponse", (city) => {
      console.log("Given city:", city);
      this.city = city;
      this.selectMapPicture(city);
    });

    socket.on("selectedPubsResponse", (selectedPubNames) => {
        this.selectedPubs = this.allPubs.filter(pub =>
            selectedPubNames.includes(pub.name)
        );
        console.log("Filtered selected pubs with coordinates:", this.selectedPubs);
    });


  },
  methods: {
    selectMapPicture(city) {
      // Välj kart bild baserat på stad
      const map = this.allMaps.find(map => map.city === city);
      console.log("Selected map:", map)
      this.selectedMap=map;
    },

}
}

</script>

<style>
body{
  margin: 0; /* Ta bort standardmarginaler */
  padding: 0;
  display: flex; /* Använd flexbox för centrering */
  justify-content: center; /* Centrera horisontellt */
  align-items: center; /* Centrera vertikalt */
  background-color:rgb(255, 240, 245);
  font-family: 'Galindo';
  height: 100vh;
  position:relative;
  }

  .map-container {
    position:absolute;
    justify-content: center;
    align-items: center;
    width:1000px;
    height: 700px;
    overflow: scroll;
    border:5px solid hotpink;
    transform: translate(-50%, -50%);
    left:50%;
    
  }

.city-map {
  width: 1356px;
  height: 1736px;
  
}

.overlay-text{
    position: absolute;
    top: 50px; 
    left: 50%; 
    transform: translate(-50%, -50%); /* Använde chat för att centrera exakt */
    color:rgb(255, 240, 245);
    text-shadow: 4px 4px 10px rgb(245, 14, 202);
    font-size: 2rem;
    z-index:10;


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
  .create-button {
  position: absolute;
  bottom: 20px; /* Placera 20px ovanför botten */
  left: 50%; /* Centrerar horisontellt */
  transform: translateX(-50%); /* Flyttar knappen så att den är helt centrerad */
  background-color: #ff416c; /* Knappens bakgrundsfärg */
  color: white; /* Textfärg */
  font-size: 1.5rem; /* Storlek på texten */
  font-family: 'Galindo', sans-serif; /* Matcha textens stil med resten */
  padding: 10px 20px; /* Utrymme runt texten */
  border: none; /* Ta bort kantlinjen */
  border-radius: 10px; /* Gör hörnen rundade */
  cursor: pointer; /* Visar pekaren vid hover */
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3); /* Lätt skugga för att skapa djup */
  z-index:5;
}

.create-button:hover {
  background-color: #ff6384; /* Färg vid hover */
}





  
</style>

