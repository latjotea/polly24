<template>
    <body>
        hej
    </body>


</template>


<script>
import io from 'socket.io-client';
const socket = io("localhost:3000");


export default{
    name:"TaskView",

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
  font-size: 2rem;
  }


</style>