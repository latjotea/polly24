/* TEA OCH EMMA ANSVARIG FÖR SENASTE VERSIONEN */
<template>
  <div>
    <div id="crawlInfo">
      <span>{{this.uiLabels.crawlID}}</span> {{ crawlId }}
    </div>
    <div v-if="!joined">
      <label>
        {{this.uiLabels.writeName}}
      </label>
      <div id="addName">
        <input type="text" v-model="userName">
        <button v-on:click="participateInPoll">
          {{ this.uiLabels.participateInPoll }}
        </button>
      </div>
    </div>
    <div v-if="joined">
      <p>Waiting for host to start poll</p>
      <div v-for="person in participants" :key="person.name">
       {{ person.name }} 
      </div>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'LobbyView',
  data: function () {
    return {
      userName: "",
      crawlId: "inactive poll",
      uiLabels: {},
      joined: false,
      lang: localStorage.getItem("lang") || "en",
      participants: []
    }
  },
  created: function () {
    this.crawlId = this.$route.params.id;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.on( "participantsUpdate", p => this.participants = p );
    socket.on( "startPoll", () => this.$router.push("/poll/" + this.crawlId) );
    socket.emit( "joinPoll", this.crawlId );
    socket.emit( "getUILabels", this.lang );
  },
  methods: {
    participateInPoll: function () {
      socket.emit( "participateInPoll", {crawlId: this.crawlId, name: this.userName} )
      this.joined = true;
    }
  }
}
</script>

<style>
body{
  margin-top: 12rem;
  background-color:rgb(255, 240, 245);
  font-family: 'Galindo';
  height: 100vh;
  }
  div {
  font-size: 1.7rem;
  font-family: 'Galindo';
  }
  #crawlInfo {
    color: rgb(65, 105, 225)
  }
  button {
    font-size: 2rem;
    font-family: 'Galindo';
    background-color: rgb(65, 105, 225);
    cursor:pointer;
  }
  button:hover{
    color:white;
  }
  input{
    font-size:2rem;
    font-family: 'Galindo';
  }
  
</style>
