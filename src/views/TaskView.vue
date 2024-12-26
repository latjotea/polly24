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
          <div>
            {{ task.text }}
            <input 
              v-if="!admin"
              type="checkbox" 
              class="task-checkbox"
              v-model="task.checked"
              @click.stop
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
      tasks: [], //Lista med alla tasks, både standardiserade och nya
      newTask: "",
      adminOrTeamId: "",
      admin: false,
      teamNumber: '',
      initialized: false
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

    socket.on("uiLabels", labels => this.uiLabels = labels);
    socket.on("taskListUpdated", this.updateTaskList);
    socket.on("selectedModeResponse", (mode) => {
      this.selectedMode = mode;
      console.log("Selected mode received:", this.selectedMode);
      
      if (!this.initialized) {
        this.loadInitialTasks();
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
      // Först hämtas existerande uppdrag från servern
      socket.emit("getTasks", { crawlId: this.crawlId }, (existingTasks) => {
        if (!existingTasks || existingTasks.length === 0) {
          // Sen hämtas uppdrag från jason-filerna och läggs till i tasks genom att ge samma standarder dvs. text, mode och checked
          const predefinedTasks = this.lang === "sv" ? taskssv : tasksen;
          const initialTasks = predefinedTasks.map(task => ({
            text: task.task,
            mode: task.mode,
            checked: false
          }));
          socket.emit("initializeTasks", {crawlId: this.crawlId,tasks: initialTasks });
        }
        this.initialized = true;
      });
    },

    submitTask() {
      if (this.newTask) {
        const newTaskObj = {
          text: this.newTask,
          mode: this.selectedMode,
          checked: false
        };
        socket.emit("addTask", {crawlId: this.crawlId, task: newTaskObj}, 
          this.tasks.push(newTaskObj), //Lägger till nytt uppdrag i tasks
          this.newTask = "",
        );
      }
    },

    toggleTask(task) {
      //Om admin försöker checka av ett uppdrag - så return
      if (admin) {
      return;
    }
      const updatedTask = { ...task, checked: !task.checked };
      socket.emit("updateTaskStatus", {crawlId: this.crawlId, taskText: task.text, checked: updatedTask.checked}, );
    },
    
    updateTaskList(tasks) {
      this.tasks = tasks;
    },

    navigateToMapView() {
      const route = `/interactivemap/${this.crawlId}/${this.adminOrTeamId}`;
      this.$router.push(route);
    }

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

.checkedTask {
  text-decoration: line-through;
  color: gray;
  pointer-events: none; /* Förhindrar klick */
  cursor: not-allowed;
}


</style>