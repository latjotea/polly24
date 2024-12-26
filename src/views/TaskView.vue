<template>
  <div class="task-container">
    <div v-if="admin" class="createTasks">
      <label>
        <input type="text" :placeholder="uiLabels.newTask" v-model="newTask">
      </label>
      <button class="submit-button" v-on:click="submitTask">{{ uiLabels.addTask }}</button>
    </div>
    <div class="modeTasks">
      <h2>{{ uiLabels.taskListTitle }}</h2>
      <ul>
        <li v-for="task in filteredTasks"
          :key="task.text"
          :class="{ 'checkedTask': task.checked }"
          @click="toggleTask(task)">
          <div class="task-item">
            <span>{{ task.text }}</span>
            <input 
              v-if="!admin"
              type="checkbox" 
              class="task-checkbox"
              :checked="task.checked"
              @click.stop
              @change="toggleTask(task)"
            />
          </div>
        </li>
      </ul>
    </div>
    <button v-on:click="navigateToMapView" id="taskButton">
      {{ uiLabels.seeMap }}
    </button>
  </div>
</template>

<script>
import io from 'socket.io-client';
import taskssv from '/server/data/tasksSv.json';
import tasksen from '/server/data/tasksEn.json';

const socket = io("localhost:3000");

export default {
  name: 'TaskView',
  data: function () {
    return {
      uiLabels: {},
      crawlId: '',
      lang: localStorage.getItem("lang") || "en",
      selectedMode: "",
      tasks: [], 
      newTask: "",
      adminOrTeamId: "",
      admin: false,
      teamNumber: '',
      initialized: false,
    }
  },
  
  computed: {
    filteredTasks() {
      return this.tasks.filter(task => task.mode === this.selectedMode);
    }
  },

  created: function () {
    this.crawlId = this.$route.params.id;
    this.adminOrTeamId = this.$route.params.adminOrTeamId;
    this.adminOrTeam();
    this.teamNumber = this.$route.params.team;

    socket.on("uiLabels", labels => this.uiLabels = labels);
    socket.on("taskListUpdated", tasks => {
      this.tasks = tasks;
      // Save tasks whenever we get an update from server
      localStorage.setItem(`tasks_${this.crawlId}`, JSON.stringify(tasks));
    });
    
    socket.on("selectedModeResponse", (mode) => {
      this.selectedMode = mode;
      console.log("Selected mode received:", this.selectedMode);
      
      if (!this.initialized) {
        // First try to load saved tasks
        const savedTasks = localStorage.getItem(`tasks_${this.crawlId}`);
        if (savedTasks) {
          socket.emit("initializeTasks", {
            crawlId: this.crawlId,
            tasks: JSON.parse(savedTasks)
          });
        } else {
          // If no saved tasks, load initial tasks
          this.loadInitialTasks();
        }
        this.initialized = true;
      }
    });

    socket.on('goToNextPub', () => {
      if (!this.admin) {
        this.$router.push(`/Destination/${this.crawlId}/${this.teamNumber}`);
      }
    });

    socket.emit("getUILabels", this.lang);
    socket.emit("getMode", { crawlId: this.crawlId });
    socket.emit("joinPoll", this.crawlId);
    socket.emit("joinPoll", this.teamNumber);
    socket.emit("getTasks", { crawlId: this.crawlId });
  },

  methods: {
    adminOrTeam() {
      if (this.adminOrTeamId.length > 10) {
        this.admin = true;
      } else {
        this.teamNumber = this.adminOrTeamId;
      }
    },

    loadInitialTasks() {
      const predefinedTasks = this.lang === "sv" ? taskssv : tasksen;
      const initialTasks = predefinedTasks.map(task => ({
        text: task.task,
        mode: task.mode,
        checked: false,
        
      }));
      
      socket.emit("initializeTasks", {
        crawlId: this.crawlId,
        tasks: initialTasks
      });
    },

    submitTask() {
      if (this.newTask) {
        const newTaskObj = {
          text: this.newTask,
          mode: this.selectedMode,
          checked: false,
          
        };
        socket.emit("addTask", {
          crawlId: this.crawlId, 
          task: newTaskObj
        });
        this.newTask = "";
      }
    },

    toggleTask(task) {
      if (this.admin) {
        return;
      }
      const newStatus = !task.checked;
      socket.emit("updateTaskStatus", {
        crawlId: this.crawlId,
        taskText: task.text,
        checked: newStatus,
        teamNumber: this.teamNumber
      });
      console.log("Task completed by",task.completedBy)
    },

    navigateToMapView() {
      const route = `/interactivemap/${this.crawlId}/${this.adminOrTeamId}`;
      this.$router.push(route);
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



.task-checkbox {
  margin-left: 1rem; 
  transform: scale(1.5); 
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

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
}

.checkedTask {
  text-decoration: line-through;
  color: gray;
  pointer-events: none; /* Förhindrar klick */
  cursor: not-allowed;
}


</style>