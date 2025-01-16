<template>
  <div class="content"> 
    <div class="task-container">
      <div v-if="admin" class="createTasks">
        <label>
          <input type="text" :placeholder="uiLabels.newTask" v-model="newTask">
        </label>
      </div>
      <div v-if="admin" class="createTasks">
        <button class="green-button" v-on:click="submitTask">{{ uiLabels.addTask }}</button>
      </div>

      <div class="task-grid">
        <div class="modeTasks">
          <h2>{{ uiLabels.taskListTitle }}</h2>
          <ul>
            <li v-for="task in filteredTasks"
              :key="task.taskId"
              :class="{ 'checkedTask': task.checked }"
              @click="toggleTask(task)">
              <div class="task-item">
                <span>{{ getTaskText(task) }}</span>
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
            <div>{{uiLabels.team}} {{ index + 1 }} : {{ score }} p </div>
          </div>
        </div>
      </div>

      <button v-on:click="navigateToMapView" class="blue-button">
        {{ uiLabels.seeMap }}
      </button>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';
import taskssv from '/server/data/tasksSv.json';
import tasksen from '/server/data/tasksEn.json';

const socket = io(sessionStorage.getItem("dataServer"));

export default {
  name: 'TaskView',
  data() {
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
      scores: [0,0,0,0,0],
      teamAmount: ''
    }
  },
  
  computed: {
    filteredTasks() {
      return this.tasks.filter(task => task.mode === this.selectedMode);
    }
  },

  created() {
    this.crawlId = this.$route.params.id;
    this.adminOrTeamId = this.$route.params.adminOrTeamId;
    
    if (this.adminOrTeamId.length > 10) {
      this.admin = true;
    } else {
      this.admin = false;
      this.teamNumber = this.adminOrTeamId; 
    }

    socket.on("uiLabels", labels => this.uiLabels = labels);
    
    socket.on("selectedModeResponse", (mode) => {
    this.selectedMode = mode;
  
      if (!this.initialized) {
        this.initialized = true;
        if (!this.tasks.length) {
          const initialTasks = tasksen.map(task => ({
            taskId: task.id,    
            text: task.task,   
            mode: task.mode,
            checked: false,
            completedBy: null
          }));
          
          socket.emit("initializeTasks", {
            crawlId: this.crawlId,
            tasks: initialTasks
          });
        }
      }
    });
    
    socket.on("scoresUpdated", (newScores) => {
      this.scores = newScores;
    });

    socket.on("taskListUpdated", tasks => {
      this.tasks = tasks;
      console.log("Tasks updated:", tasks);
    });

    socket.on("selectedTeamAmountResponse", (teamAmount) => {
      this.teamAmount = teamAmount; 
      console.log("Antalet lag är:", this.teamAmount);
    });

    socket.on('goToNextPub', () => {
      if (!this.admin){
        this.$router.push(`/Destination/${this.crawlId}/${this.teamNumber}`)}
    });

    socket.emit("getUILabels", this.lang);
    socket.emit("getMode", { crawlId: this.crawlId });
    socket.emit("joinCrawl", this.crawlId);
    socket.emit("joinCrawl", this.teamNumber);
    socket.emit("getTasks", { crawlId: this.crawlId });
    socket.emit("getTeamAmount", { crawlId: this.crawlId });
    socket.emit("getScores", { crawlId: this.crawlId });
  },

  methods: {
    getTaskText(task) {
      //AI har hjälp med findIndex()
      const taskIndex = tasksen.findIndex(t => t.id === task.taskId);
      if (taskIndex === -1) return task.text; 
      
      const translations = this.lang === "sv" ? taskssv : tasksen;
      return translations[taskIndex].task;
    },

    submitTask() {
      if (this.newTask) {
        const newTaskObj = {
          text: this.newTask,
          taskId: `admin-${Date.now()}`,// AI hjälpte oss med unik nyckel
          mode: this.selectedMode,
          checked: false,
          completedBy: null
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
      if (!task.completedBy || task.completedBy === this.teamNumber) {
        if (newStatus) {
          this.updateScore(this.teamNumber);
        }
        
        socket.emit("updateTaskStatus", {
          crawlId: this.crawlId,
          taskId: task.taskId,
          checked: newStatus,
          teamNumber: this.teamNumber
        });
      }
    },

    navigateToMapView() {
      this.$router.push(`/interactivemap/${this.crawlId}/${this.adminOrTeamId}`);
    },

    updateScore() {
      const adjustedTeamNumber = this.teamNumber - 1;
      this.scores[adjustedTeamNumber]++;
      socket.emit("updateScores", {
        crawlId: this.crawlId,
        scores: this.scores
      });
      console.log(`Team ${this.teamNumber} score updated to ${this.scores[adjustedTeamNumber]}`);
    }
  },
}
</script>

<style>

body {
margin-top: 1rem;
height: 100vh;
}

.task-container{
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-top: 2rem;
  width: 100%;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 1rem;
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
  width: 100%;
  position: relative;
  padding-bottom: 3rem;
}

.modeTasks {
  background-color: rgb(65, 105, 225);
  color: white;
  padding: 1rem;
  border-radius: 15px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  font-size: 3rem;
  width: 100%;
  text-align: center;
}

#scoreboard {
  background-color: hotpink;
  color: white;
  padding: 1rem;
  border-radius: 15px;
  width: 100%;
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

.task-item {
  display: flex;
  justify-content: space-between;
  text-align: left;
  align-items: flex-start;
  padding: 0.5rem;
}

.task-item span {
  text-align: left;
  flex: 1;
}

.checkedTask {
  text-decoration: line-through;
  color: gray;
  pointer-events: none; 
  cursor: not-allowed;
}

.task-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
}


.blue-button {
  width: 100%;
  max-width: 400px;
  padding: 0.5rem 1rem;
}

.green-button {
  position: absolute;
  bottom: 0;
  padding: 0.5rem 1rem;
}


@media screen and (max-width: 600px) {

  .content{
    display: flex;
    justify-content: center;
    
  }

  .task-container{
    width: 90%;
    height: 500px;
    margin: 1rem;
    display:flex;
  }

  .modeTask h2 {
    font-size: 2rem;
  }

  div {
    font-size: 1.4rem;
  }

  .destination-header {
    font-size: 3rem;
  }

  .blue-button{
    font-size: 3rem;
  }


}



</style>