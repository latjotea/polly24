<template>

    <body>
        <p> hej</p>
        <div>
        <button v-on:click="navigateToCreate">
          {{ uiLabels.createCrawl }}
        </button>
    </div>
    </body>
</template>


<script>

import Pubs from '/server/data/Pubs.json';

export default{
    name:"DestinationView",
    

data: function () {
    return {
      uiLabels: {},
     
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

header h1{
    color: black;
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


</style>