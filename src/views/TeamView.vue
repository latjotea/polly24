<template>
    <body>
        <h1>{{ uiLabels.goTo }}</h1>

        <div>
            <button v-on:click="decreaseTeam">-</button>
            <button v-on:click="increaseTeam">+</button>
            <p>{{ amountTeams }}</p>
        </div>


    </body>
</template>

<script>
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default{
    name:"TeamView",

data: function () {
return {
    amountTeams: 0,
    uiLabels: {},
    }
},


created: function () {
this.pollId = this.$route.params.id;
socket.on( "uiLabels", labels => this.uiLabels = labels );
socket.emit( "getUILabels", this.lang );

},

methods:{
    increaseTeam() {
      this.amountTeams++;
      this.$emit('orderedBurger', { name:   this.burger.name, amount: this.amountOrdered });
    },

    decreaseTeam() {
      this.amountTeams = Math.max(0, this.amountTeams - 1);
      this.$emit('orderedBurger', { name:   this.burger.name, amount: this.amountOrdered}); 
    },
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

</style>