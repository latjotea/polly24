<template>
  <div class="task-container">
    <div v-if="admin" class="createTasks">
      <label>
        <input type="text" :placeholder="uiLabels.newTask" v-model="newTask">
      </label>
      <button class="submit-button" v-on:click="submitTask">{{ uiLabels.addTask }}</button>
    </div>

    <div class="task-grid">
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
            v-if="!admin && (!task.completedBy || task.completedBy === teamNumber)"
            type="checkbox" 
            class="task-checkbox"
            :checked="task.checked"
            @click.stop
            @change="toggleTask(task)"/>
        </div>
      </li>
    </ul>
  </div>
  
  <div id="scoreboard">
    <p>{{ uiLabels.points }}</p>
    <div v-for="(score, index) in scores.slice(0,teamAmount)" 
         :key="index" >
      <div>{{uiLabels.team}} {{ index + 1 }} : {{ score }}</div>
    </div>
  </div>

    </div>
    <button v-on:click="navigateToMapView" id="mapButton">
      {{ uiLabels.seeMap }}
    </button>
  </div>

  
</template>

<script>
import io from 'socket.io-client';
import taskssv from '/server/data/tasksSv.json';
import tasksen from '/server/data/tasksEn.json';

const socket = io(sessionStorage.getItem("dataserver"));

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
      lastToggledTask: null,
      scores: [0,0,0,0,0],
      teamAmount:''
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
    if (this.adminOrTeamId.length > 10) {
      this.admin = true;
    } else {
      this.admin = false;
      this.teamNumber = this.adminOrTeamId; 
    }
    console.log("Team number initialized as:", this.teamNumber);
    

    socket.on("uiLabels", labels => this.uiLabels = labels);
    socket.on("taskListUpdated", tasks => {
      this.tasks = tasks;
      localStorage.setItem(`tasks_${this.crawlId}`, JSON.stringify(tasks));
      
      if (this.lastToggledTask) {
        const updatedTask = tasks.find(t => t.text === this.lastToggledTask.text);
        if (updatedTask) {
          console.log("Task completed by", updatedTask.completedBy);
        }
        this.lastToggledTask = null; 
      }
    });
    
    socket.on("selectedModeResponse", (mode) => {
      this.selectedMode = mode;
      console.log("Selected mode received:", this.selectedMode);
      
      if (!this.initialized) {
        const savedTasks = localStorage.getItem(`tasks_${this.crawlId}`);
        if (savedTasks) {
          socket.emit("initializeTasks", {
            crawlId: this.crawlId,
            tasks: JSON.parse(savedTasks)
          });
        } else {
          this.loadInitialTasks();
        }
        this.initialized = true;
      }
    });
    
    socket.on("scoresUpdated", (newScores) => {
      this.scores = newScores;
      localStorage.setItem(`scores_${this.crawlId}`, JSON.stringify(newScores));
    });

    const savedScores = localStorage.getItem(`scores_${this.crawlId}`);
    if (savedScores) {
      this.scores = JSON.parse(savedScores);
    } else {
      socket.emit("getScores", { crawlId: this.crawlId });
    }

    socket.on('goToNextPub', () => {
      if (!this.admin) {
        this.$router.push(`/Destination/${this.crawlId}/${this.teamNumber}`);
      }
    });

    socket.on("selectedTeamAmountResponse", (teamAmount) => {
      this.teamAmount = teamAmount; 
      console.log("Antalet lag är:", this.teamAmount);
    });

    socket.emit("getUILabels", this.lang);
    socket.emit("getMode", { crawlId: this.crawlId });
    socket.emit("joinCrawl", this.crawlId);
    socket.emit("joinCrawl", this.teamNumber);
    console.log("Team number initialized as:", this.teamNumber);
    socket.emit("getTasks", { crawlId: this.crawlId });
    socket.emit("getTeamAmount", {crawlId: this.crawlId });
  },

  methods: {

    loadInitialTasks() {
      const predefinedTasks = this.lang === "sv" ? taskssv : tasksen;
      const initialTasks = predefinedTasks.map(task => ({
        text: task.task,
        mode: task.mode,
        checked: false,
        completedBy:null,
        
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
          completedBy:null,
          
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
      this.lastToggledTask = task; // Store the task being toggled
      if (newStatus) {
        this.updateScore(this.teamNumber);
      }
      
      socket.emit("updateTaskStatus", {
        crawlId: this.crawlId,
        taskText: task.text,
        checked: newStatus,
        teamNumber: this.teamNumber
      });
    },

    navigateToMapView() {
      const route = `/interactivemap/${this.crawlId}/${this.adminOrTeamId}`;
      this.$router.push(route);
    },

    updateScore() {
      const adjustedTeamNumber = this.teamNumber - 1;
      this.scores[adjustedTeamNumber]++;
      socket.emit("updateScores", {crawlId: this.crawlId,scores: this.scores});
      console.log(`Team ${this.teamNumber} score updated to ${this.scores[adjustedTeamNumber]}`);
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

.task-container{
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
  flex: 2;
}

#scoreboard {
  background-color: hotpink;
  color: white;
  padding: 1rem;
  border-radius: 15px;
  width: 15rem;
  text-align: center;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  height: fit-content;
  align-self: flex-start;
  flex: 1;
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

.task-grid {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 0 2rem;
  margin: 0 auto;
  max-width: 1200px;
}

#mapButton {
margin-top: 1rem;
font-size: 1.7rem;
font-family: 'Galindo';
background-color: rgb(65, 105, 225);
border: none;
padding: 0.5rem 1rem;
border-radius: 10px;
cursor: pointer;
transition: background-color 0.3s;
box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);

}

@media (max-width: 1070px) {
  .task-grid {
    flex-direction: column; 
    align-items: center;


    #scoreboard {
    align-self: center; 
    width: 100%; 
    margin-bottom: 1rem;
  }

  .modeTasks {
    width: 100%; 
  }
}
}


</style>