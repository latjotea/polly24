
<template>
    <div class="task-container">
        <div class="createTasks">
            <label>
                <input type="text" :placeholder="uiLabels.newTask">
            </label>
            <button class="submit-button" v-on:click="submitTask"> {{ uiLabels.addTask }} </button>
        </div>
        <div class="modeTasks">
            <h2>{{ uiLabels.taskListTitle }}</h2>
            <ul>
              <li v-for="task in tasks.filter(task => task.mode === selectedMode)" :key="task.task">
                {{ task.task }}
              </li>
            </ul>
        </div>
    </div>
    
  </template>
  
  <script>
  import io from 'socket.io-client';
  import pubs from '/server/data/Pubs.json';
  import taskssv from '/server/data/tasksSv.json';
  import tasksen from '/server/data/tasksEn.json';
  
  const socket = io("localhost:3000");
  
  
  export default {
    name: 'AdminTaskView',
    data: function () {
      return {
        uiLabels: {},
        lang: localStorage.getItem("lang") || "en",
        selectedMode: "standard",
        tasks: []
      }
    },
    created: function () {
      this.crawlId = this.$route.params.id;
      socket.on( "uiLabels", labels => this.uiLabels = labels );
      socket.emit( "getUILabels", this.lang );
      this.loadTasks();
      //this.getCurrentMode(); 
    
    },

    methods: {

    loadTasks() {
    if (this.lang === "sv") {
      this.tasks = taskssv;
          } else {
      this.tasks = tasksen;
      }
    console.log("Loaded tasks:", this.tasks);
    },  

    //tror denna funktion kommer att fungera om man kan koplla denna sida till et  crawlID
   // getCurrentMode() {
   //   socket.emit("getMode", { crawlId: this.crawlId }); 
    //  socket.on("selectedModeResponse", (mode) => {
    //    console.log("Received mode:", mode); 
     //   this.selectedMode = mode; });
 // },

  
    submitTask(){

      //här ska en funktion för vad som sker då man skickar in ett nytt uppdrag vara//

    },
    
  }
}
  
  </script>
  
  <style>

body {
  margin-top: 1rem;
  background-color: rgb(255, 240, 245);
  font-family: 'Galindo';
  height: 100vh;
}

div {
  font-size: 1.7rem;
  font-family: 'Galindo';
  
}

.task-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-top: 2rem;
}

.createTasks {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.createTasks input[type="text"] {
  font-size: 1.7rem;
  padding: 0.5rem;
  border-radius: 10px;
  border: 2px solid rgb(65, 105, 225);
  width: 40rem;
  height: 5rem;
  font-family: 'Galindo';
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);


}

.createTasks button {
  margin-top: 1rem;
  font-size: 1.7rem;
  font-family: 'Galindo';
  background-color: rgb(100, 200, 100);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);

}

.createTasks button:hover {
  background-color: rgb(141, 242, 141);
  
}

.modeTasks {
  background-color: rgb(65, 105, 225);
  color: white;
  padding: 1rem;
  border-radius: 15px;
  width: 40rem;
  text-align: center;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);

  
}

.modeTasks h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.modeTasks ul {
  list-style-type: none;
  padding: 0;
}

.modeTasks ul li {
  font-size: 1.7rem;
  margin: 0.5rem 0;
}

input[type="checkbox"] {
  margin-left: 2rem;
  transform: scale(2.5);
}

input[type="checkbox"]:checked {
  accent-color: hotpink;
}

  
  </style>
  