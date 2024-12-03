<template>
    <body>
      <h1>{{ uiLabels.goTo }}</h1>

      <div id="goto">
        <button>
          {{ uiLabels.imHere }}
        </button>
    </div>
    </body>
</template>


<script>
import io from 'socket.io-client';
const socket = io("localhost:3000");
import Pubs from '/server/data/Pubs.json';

export default{
    name:"DestinationView",
    
data: function () {
    return {
      uiLabels: {},
      selectedPubs: [], /*koppla över socket till publistview*/
      teamPubs: [] 
    }
  },
  created: function () {
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
  },
}
</script>


<style>
body{
  margin-top: 12rem;
  background-color:rgb(255, 240, 245);
  font-family: 'Galindo';
  height: 100vh;
  font-size: 2rem;
  }

#goto button{
    font-size: 2rem;
    font-family: 'Galindo';
    background-color: rgb(65, 105, 225);
    cursor:pointer;
  }

#goto button:hover{
    color:white;
  }
</style>