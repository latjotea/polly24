

<template>
   <div class="selectedPubs-text">
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
        <button v-on:click="navigateToAdminTeamView" class="green-button"> 
          {{this.uiLabels.createCrawl}}
        </button>
      </div>

</template>

<script>
import io from 'socket.io-client';
import pubs from '/server/data/Pubs.json';
import maps from '/server/data/Maps.json';

const socket = io(sessionStorage.getItem("dataServer"));


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
    socket.emit( "participateInCrawl", {crawlId: this.crawlId, name: "Admin", team:'', arrived: false, admin:true} );
    
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


  },
  methods: {
    selectMapPicture(city) {
      // Välj kart bild baserat på stad
      const map = this.allMaps.find(map => map.city === city);
      console.log("Selected map:", map)
      this.selectedMap=map;
    },

    navigateToAdminTeamView(){
      this.$router.push(`/lobby/${this.crawlId}/admin_${socket.id}`);



}
}
}


</script>

<style scoped>

.selectedPubs-text {
  text-align: center;
  color: black;
  font-size: 2rem;
  margin-bottom: 1rem;
  padding-top: 2rem;
  position: relative;
}

.map-container {
  position: relative;
  margin: 0 auto;
  width: 1000px;
  height: 700px;
  overflow: scroll;
  border: 5px solid hotpink;
  margin-bottom: 4rem;
}

.city-map {
  width: 1356px;
  height: 1736px;
}

/*/AI FÖR ATT GÖRA EN PRICK /*/
.marker-container {
  position: absolute;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 2;
}

.marker {
  width: 15px;
  height: 15px;
  background-color: white;
  border: 2px solid rgb(49, 187, 49);
  border-radius: 50%;
}

.pub-label {
  display: block;
  color: white;
}

@media screen and (max-width: 600px) {
  .map-container {
    width: 90%;
    height: 500px;
    margin: 1rem;
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

