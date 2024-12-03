/*/ TEA OCH EMMA ANSVARIG FÖR SENASTE VERSIONEN /*/
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
      pubList: pubs,
      selectedPubs: []
    }
  },
  created: function () {
    this.pollId = this.$route.params.id;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
  },
  methods: {
    navigateToPubList() {
    this.$router.push('/pubList/');
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
            socket.emit("sendSelectedPubs",this.selectedPubs);

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
