<template>
    <body>
        <h1>"{{ uiLabels.tasks}}"</h1>
        <li v-for="(task, index) in tasks" :key="index">
            {{ task }}
        </li>
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
      task: [],
      lang: localStorage.getItem("lang") || "en",

      
    }
  },
  created: function () {
  socket.on("uiLabels", (labels) => {
    this.uiLabels = labels;
  });
  socket.emit("getUILabels", this.lang); 
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