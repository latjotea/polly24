

<template>
    <div class="map-container">
        <img v-if="selectedMap" :src="selectedMap.picture" class="city-map"/>
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
      //allPubs: pubs,
      //selectedPubs: [],
      //pubList: [],
      allMaps: maps,
      selectedMap: null
    }
  },
  created: function () {
    this.crawlId = this.$route.params.id;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
    socket.emit("getCity", {crawlId: this.crawlId });
    //socket.emit("getSelectedPubs", {crawlId: this.crawlId });
    
    socket.on("selectedCityResponse", (city) => {
      console.log("Given city:", city);
      this.city = city;
      //this.updatePubList(city); // Uppdatera publistan när en stad väljs
      this.selectMapPicture(city);
    });

    //socket.on("selectedPubsResponse", (selectedPubs) => {
        //this.selectedPubs = selectedPubs;
        //console.log("Hämtade pubar från servern:", this.selectedPubs); 

   //});
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

  background-color:rgb(255, 240, 245);
  font-family: 'Galindo';
  height: 100vh;
  }

  .map-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: auto;
  overflow: hidden; /* För att undvika att scrollbars visas om bilden är för stor */
}

.city-map {
  width: 100%;
  height: auto;
  object-fit: cover;
}
  
</style>

