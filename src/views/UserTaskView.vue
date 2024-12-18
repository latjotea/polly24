<template>
  <div class="task-container">
      
      <div class="modeTasks">
          <h2>{{ uiLabels.taskListTitle }}</h2>
          <ul>
            <li v-for="task in taskList.filter(task => task.mode === this.selectedMode)" :key="task.task">
              {{ task.task }}
            </li>
            
            <li v-for="task in newTasks" :key="task">
              {{ task }}
            </li>

          </ul>
          <div class="viewMap">
          
          <button class="viewMap-button" v-on:click="seeMap"> {{ uiLabels.seeMap }} </button>
      </div>
      </div>
  </div>

</template>


<script>

import io from 'socket.io-client';
import taskssv from '/server/data/tasksSv.json';
import tasksen from '/server/data/tasksEn.json';

const socket = io("localhost:3000");


export default {
  name: 'UserTaskView',
  data: function () {
    return {
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      selectedMode: "",
      taskList: [],
      newTasks: []
    } 
  },
  created: function () {
    this.crawlId = this.$route.params.id;
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
    this.loadTasks();
    socket.emit("getMode", { crawlId: this.crawlId });
    socket.on("selectedModeResponse", (mode) => {
    this.selectedMode = mode;
    console.log("Selected mode received:", this.selectedMode);
    this.fetchSubmittedTasks();
    console.log("fetchade tasks", this.newTasks)


});
  
  },

  methods: {

  loadTasks() {
  if (this.lang === "sv") {
    this.taskList = taskssv;
        } else {
    this.taskList = tasksen;
    }
  console.log("Loaded tasks:", this.taskList);
  },

  fetchSubmittedTasks() {
  socket.emit("getSubmittedTasks", this.crawlId);
  socket.on("selectedSubmittedTasks", (tasks) => {
    this.newTasks = tasks; 
    console.log("nya tasks:", this.newTasks);
  });
},
}
}

</script>


<style>




</style>