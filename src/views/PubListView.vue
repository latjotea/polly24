
<template>
  <div>
    {{this.uiLabels.choosePubs}} 
    <div class="pub-grid">
      <div v-for="pub in pubList" :key="pub.name" class="pub-section">
        <label>{{ pub.name }}</label>
        <input 
          type="checkbox" 
          :id="pub.name" 
          v-model="pub.selected"
          v-on:change="updateSelectedPubs(pub)" 
        />
      </div>
    </div>
    <button v-on:click="submitSelection" v-bind:disabled="selectedPubs.length===0"> {{this.uiLabels.sendPubs}} </button>
  </div>


</template>

<script>
import io from 'socket.io-client';
import pubs from '/server/data/Pubs.json';

const socket = io("localhost:3000");


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
    this.pollId = this.$route.params.id;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
    socket.emit("getSelectedCity", {pollId: this.pollId });
    
    socket.on("citySelectedResponse", (city) => {
      console.log("Given city:", city);
      this.city = city;
      this.updatePubList(city); // Uppdatera publistan när en stad väljs
    });
  },
  methods: {
    navigateToPubList() {
    this.$router.push('/pubList/');
    },

    updatePubList(city) {
      // Filtrera pubar baserat på vald stad
      this.pubList = this.allPubs.filter(pub => pub.city === city);
      console.log(pubList)
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
            socket.emit("sendSelectedPubs", { selectedPubs: this.selectedPubs, pollId: this.pollId });

      console.log("Valda pubar:", this.selectedPubs);
    }
}
}
}
</script>

<style>
body{
  margin-top: 1rem;
  background-color:rgb(255, 240, 245);
  font-family: 'Galindo';
  height: 100vh;
  }
  div {
  font-size: 1.7rem;
  font-family: 'Galindo';
  }

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
    width:80%;
    text-align: center;
}
input[type="checkbox"] {
    margin-left:2rem;
    transform: scale(2.5); /* Chat användes för att göra knappen större */
  
}
input[type="checkbox"]:checked {
  accent-color:hotpink; /* Ändrar färgen när markerad */
}
button {
    margin-top:3rem;
    font-size: 2rem;
    font-family: 'Galindo';
    background-color: rgb(141, 242, 141);
    cursor:pointer;
  }
  
</style>
