'use strict';
import {readFileSync} from "fs";
import path, { dirname } from "path";

function Data() {
  this.crawls = {
    lang: "en",
    participants: [],
    selectedPubs: [],
    mode:'',
    city:'',
    teamAmount: '',
    teams: [],
    submittedTasks:[],
    taskList:[],
    round: '',
    chosenPubs: [],
  };
  this.crawls['test'] = {
    lang: "en",
    participants: [],
    selectedPubs: [],
    mode:'',
    city:'',
    teamAmount: '',
    teams: [],
    submittedTasks:[],
    taskList:[],
    round: '',
  }
  this.activeCrawls = ['test'];
}

/***********************************************
For performance reasons, methods are added to the
prototype of the Data object/class
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
***********************************************/

Data.prototype.crawlExists = function (crawlId) {
  return typeof this.crawls[crawlId] !== "undefined"
}

Data.prototype.setSelectedPubs = function (crawlId, selectedPubs) {
  if (!this.crawlExists(crawlId)) {
    return false;
  }
  this.crawls[crawlId].selectedPubs = selectedPubs
  return true
}

Data.prototype.getSelectedPubs = function (crawlId) {
  if (!this.crawlExists(crawlId)) return false;

  return this.crawls[crawlId].selectedPubs
}

Data.prototype.setMode = function (crawlId, mode) {
  if (!this.crawlExists(crawlId)) {
    return false;
  }
  this.crawls[crawlId].mode = mode; 
  return true;
};


Data.prototype.getMode = function (crawlId) {
  if (!this.crawlExists(crawlId)) {
    return null;
  }
  return this.crawls[crawlId].mode; 
};

Data.prototype.addSubmittedTask = function(crawlId, task) {
  if (!this.crawlExists(crawlId)) return false;
  this.crawls[crawlId].submittedTasks.push(task);
  return true;
};

Data.prototype.getSubmittedTasks = function(crawlId) {
  if (!this.crawlExists(crawlId)) return [];
  return this.crawls[crawlId].submittedTasks;
};


Data.prototype.setCity = function (crawlId, city) {
  if (!this.crawlExists(crawlId)) {
    return false;
  }
  this.crawls[crawlId].city = city; 
  return true;
};

Data.prototype.getCity = function (crawlId) {
  if (!this.crawlExists(crawlId)) {
    return null;
  }
  return this.crawls[crawlId].city; 
};

Data.prototype.setTeamAmount = function (crawlId, teamAmount) {
  if (!this.crawlExists(crawlId)) {
    return false;
  }
  this.crawls[crawlId].teamAmount = teamAmount; 
  return true;
};

Data.prototype.getTeamAmount = function (crawlId) {
  if (!this.crawlExists(crawlId)) {
    return null;
  }
  return this.crawls[crawlId].teamAmount; 
};

Data.prototype.setTeams = function (crawlId, teams) {
  if (!this.crawlExists(crawlId)) {
    return null;
  }
  this.crawls[crawlId].teams = teams; 
  return true};


Data.prototype.getUILabels = function (lang) {
  //check if lang is valid before trying to load the dictionary file
  if (!["en", "sv"].some( el => el === lang))
    lang = "en";
  const labels = readFileSync("./server/data/labels-" + lang + ".json");
  return JSON.parse(labels);
}

Data.prototype.isActiveCrawl = function(crawlId) {
  return this.activeCrawls.includes(crawlId);
}

Data.prototype.addActiveCrawl = function(crawlId) {
  if (!this.isActiveCrawl(crawlId)) {
    this.activeCrawls.push(crawlId);
    return true;
  }
  return false;
}

//AI har skrivit denna:
Data.prototype.removeActiveCrawl = function(crawlId) {
  const index = this.activeCrawls.indexOf(crawlId);
  if (index > -1) {
    this.activeCrawls.splice(index, 1);
    return true;
  }
  return false;
}

Data.prototype.createCrawl = function(crawlId, lang="en") {
  if (!this.crawlExists(crawlId)) {
    let poll = {};
    poll.lang = lang;  
    poll.mode = '';
    poll.city = '';
    poll.teamAmount = '';
    poll.teams = [];
    poll.participants = [];
    poll.submittedTasks = [];             
    this.crawls[crawlId] = poll;
    poll.taskList = [];
    poll.round = 1;
    poll.chosenPubs = [];
    poll.scores=[0,0,0,0,0]
    this.addActiveCrawl(crawlId);
    console.log("poll created", crawlId, poll);
    console.log("aktiva crawls:", this.activeCrawls )
  }
  return this.crawls[crawlId];
}

Data.prototype.endCrawl = function(crawlId) {
  if (this.crawlExists(crawlId)) {
    delete this.crawls[crawlId];
    this.removeActiveCrawl(crawlId);
    return true;
  }
  return false;
}

Data.prototype.getCrawl = function(crawlId) {
  if (this.crawlExists(crawlId)) {
    return this.crawls[crawlId];
  }
  return {};
}

Data.prototype.participateInCrawl = function(crawlId, name) {
  console.log("participant will be added to", crawlId, name);
  if (this.crawlExists(crawlId)) {
    this.crawls[crawlId].participants.push({name: name, team:'', arrived: false, admin: false})
  }
}

Data.prototype.getParticipants = function(crawlId) {
  const poll = this.crawls[crawlId];
  console.log("participants requested for", crawlId);
  if (this.crawlExists(crawlId)) { 
    return this.crawls[crawlId].participants
  }
  return [];
}

Data.prototype.setChosenPub = function(crawlId, chosenPub) {
  if (!this.crawlExists(crawlId)) {
    return false;
  }
  this.crawls[crawlId].chosenPub = chosenPub;
  console.log("Chosen pub set to:", chosenPub, "for crawlId:", crawlId);
  return true;
};

Data.prototype.setChosenPubs = function(crawlId, teamNumber, chosenPub) {
  console.log("team ", teamNumber, "have been assigned to ", chosenPub);
  if (this.crawlExists(crawlId)) {
    const existingTeamIndex = this.crawls[crawlId].chosenPubs.findIndex(
      pub => pub.teamNumber === teamNumber
    );
    if (existingTeamIndex !== -1) {
      this.crawls[crawlId].chosenPubs[existingTeamIndex].chosenPub = chosenPub;} 
    else {
      this.crawls[crawlId].chosenPubs.push({teamNumber: teamNumber, chosenPub: chosenPub});}
  }
};

Data.prototype.getChosenPubs = function(crawlId) {
  if (!this.crawlExists(crawlId)) {
    return null;
  }
  return this.crawls[crawlId].chosenPubs;
};

Data.prototype.updateRound = function (crawlId) {
  if (!this.crawlExists(crawlId)) {
    return false;
  }
  this.crawls[crawlId].round += 1; 
  return true
}

Data.prototype.getRound = function (crawlId) {
  if (!this.crawlExists(crawlId)) {
    return null;
  }
  return this.crawls[crawlId].round; 
};


Data.prototype.initializeTasks = function(crawlId, tasks) {
  if (!this.crawlExists(crawlId)) {
    return false;
  }
  if (this.crawls[crawlId].taskList && this.crawls[crawlId].taskList.length > 0) {
    return this.getTasks(crawlId);
  }
  
  const tasksWithDefaults = tasks.map(task => ({
    taskId: task.taskId,  
    text: task.text,
    mode: task.mode,
    checked: false,
    completedBy: null
  }));
  
  this.crawls[crawlId].taskList = tasksWithDefaults;
  return this.getTasks(crawlId);
};

Data.prototype.addTask = function(crawlId, task) {
  if (!this.crawlExists(crawlId)) {
    return false;
  }
  const newTask = {
    taskId:task.taskId,
    text: task.text,
    mode: task.mode,
    checked: false,
    completedBy: null
  };
  
  this.crawls[crawlId].taskList.push(newTask);
  return this.getTasks(crawlId);
};

Data.prototype.updateTaskStatus = function(crawlId, taskId, checked, teamNumber) {
  if (!this.crawlExists(crawlId)) {
    return false;
  }
  //AI har skrivit den här raden:
  const task = this.crawls[crawlId].taskList.find(t => t.taskId === taskId);
  if (task) {
    if (!task.completedBy || task.completedBy === teamNumber) {
      task.checked = checked;
      if (checked) {
        task.completedBy = teamNumber;
      } else {
        if (task.completedBy === teamNumber) {
          task.completedBy = null;
        }
      }
    }
  }
  
  return this.getTasks(crawlId);
};

Data.prototype.getTasks = function(crawlId) {
  if (!this.crawlExists(crawlId)) {
    return [];
  }
  return this.crawls[crawlId].taskList || [];
};

Data.prototype.initializeScores = function(crawlId) {
  if (!this.crawlExists(crawlId)) {
    return false;
  }
  if (!this.crawls[crawlId].scores) {
    this.crawls[crawlId].scores = [0, 0, 0, 0, 0]; 
  }
  return this.crawls[crawlId].scores;
};

Data.prototype.updateScores = function(crawlId, scores) {
  if (!this.crawlExists(crawlId)) {
    return false;
  }
  this.crawls[crawlId].scores = scores;
  return this.crawls[crawlId].scores;
};

Data.prototype.getScores = function(crawlId) {
  if (!this.crawlExists(crawlId)) {
    return null;
  }
  if (!this.crawls[crawlId].scores) {
    return this.initializeScores(crawlId);
  }
  return this.crawls[crawlId].scores;
};


export { Data };