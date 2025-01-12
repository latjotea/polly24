
<template>
  <body>
    <div>
      <h2> {{this.uiLabels.choosePubs}} </h2>
      <div class="pub-grid">
        <div 
          v-for="pub in pubList" 
          :key="pub.name" 
          class="pub-section" 
          :class="{ 'selected-pub': pub.selected }"
          v-on:click="togglePubSelection(pub)">
          <label :for="pub.name" class="pub-label" @click="togglePubSelection(pub)">
            {{ pub.name }}
          </label>
          <input 
            type="checkbox" 
            class="pub-checkbox"
            :id="pub.name" 
            v-model="pub.selected"
            v-on:change="updateSelectedPubs(pub)" />
        </div>
      </div>
      <button v-on:click="submitSelection" v-bind:disabled="selectedPubs.length===0" class="green-button"> {{this.uiLabels.sendPubs}} </button>
    </div>
  </body>
</template>

<script>
import io from 'socket.io-client';
import pubs from '/server/data/Pubs.json';

const socket = io(sessionStorage.getItem("dataServer"));


export default {
  name: 'PubListView',
  data: function () {
    return {
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      city:"",
      allPubs: pubs,
      selectedPubs: [],
      pubList: [],
    }
  },
  created: function () {
    this.crawlId = this.$route.params.id;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
    socket.emit("getCity", {crawlId: this.crawlId });
    
    socket.on("selectedCityResponse", (city) => {
      console.log("Given city:", city);
      this.city = city;
      this.updatePubList(city); // Uppdatera publistan när en stad väljs
    });
  },
  methods: {

    updatePubList(city) {
      // Filtrera pubar baserat på vald stad
      this.pubList = this.allPubs.filter(pub => pub.city === city);
      console.log(this.pubList)
    },

    togglePubSelection(pub) {
      // Växla pub.selected mellan true och false
      pub.selected = !pub.selected;
      this.updateSelectedPubs(pub);
    },

    updateSelectedPubs(pub) {
      if (pub.selected) {
        if (!this.selectedPubs.includes(pub.name)) {
          this.selectedPubs.push(pub.name);
        }
        /*/Vi har använt Chat för else raderna /*/
      } else {
        this.selectedPubs = this.selectedPubs.filter(
          (selectedPub) => selectedPub !== pub.name
        );
      }
    },
    submitSelection() {
        if (this.selectedPubs.length > 0) {
            socket.emit("sendSelectedPubs", { selectedPubs: this.selectedPubs, crawlId: this.crawlId });

      console.log("Valda pubar:", this.selectedPubs);
      this.$router.push(`/${this.crawlId}/map/`);
    }
}
}
}
</script>

<style>

  .pub-grid {
    display: flex;
    flex-direction: column; 
    align-items: center; 
    gap: 1rem; 
    margin-top: 2rem;
}
.pub-section{
    background-color: rgb(65, 105, 225);
    font-size: 3rem;
    border-radius: 15px;
    width:85%;
    text-align: center;
    cursor: pointer; 
    display: flex; 
    justify-content: space-between; 
    align-items: center; 
    padding: 0.5rem 1.5rem;
}

.selected-pub {
  background-color: rgb(135, 181, 250);
  color: white; 
  transition: background-color 0.3s;
}

.pub-label {
  cursor: pointer;
  flex-grow: 1; 
}

.pub-checkbox {
  margin-left: 1rem; 
  transform: scale(1.5);
  flex-shrink: 0;  
}

.pub-gird ul li {
  font-size: 1.7rem;
  margin: 0.5rem 0;
}



  
</style>
