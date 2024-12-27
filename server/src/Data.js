'use strict';
import {readFileSync} from "fs";
import path, { dirname } from "path";

// Store data in an object to keep the global namespace clean. In an actual implementation this would be interfacing a database...
function Data() {
  this.polls = {
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
  this.polls['test'] = {
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
}

/***********************************************
For performance reasons, methods are added to the
prototype of the Data object/class
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
***********************************************/

Data.prototype.pollExists = function (crawlId) {
  return typeof this.polls[crawlId] !== "undefined"
}

Data.prototype.setSelectedPubs = function (crawlId, selectedPubs) {
  if (!this.pollExists(crawlId)) {
    return false;
  }
  this.polls[crawlId].selectedPubs = selectedPubs
  return true
}

Data.prototype.getSelectedPubs = function (crawlId) {
  if (!this.pollExists(crawlId)) return false;

  return this.polls[crawlId].selectedPubs
}

Data.prototype.setMode = function (crawlId, mode) {
  if (!this.pollExists(crawlId)) {
    return false;
  }
  this.polls[crawlId].mode = mode; 
  return true;
};


Data.prototype.getMode = function (crawlId) {
  if (!this.pollExists(crawlId)) {
    return null;
  }
  return this.polls[crawlId].mode; 
};

Data.prototype.addSubmittedTask = function(crawlId, task) {
  if (!this.pollExists(crawlId)) return false;
  this.polls[crawlId].submittedTasks.push(task);
  return true;
};

Data.prototype.getSubmittedTasks = function(crawlId) {
  if (!this.pollExists(crawlId)) return [];
  return this.polls[crawlId].submittedTasks;
};


Data.prototype.setCity = function (crawlId, city) {
  if (!this.pollExists(crawlId)) {
    return false;
  }
  this.polls[crawlId].city = city; 
  return true;
};

Data.prototype.getCity = function (crawlId) {
  if (!this.pollExists(crawlId)) {
    return null;
  }
  return this.polls[crawlId].city; 
};

Data.prototype.setTeamAmount = function (crawlId, teamAmount) {
  if (!this.pollExists(crawlId)) {
    return false;
  }
  this.polls[crawlId].teamAmount = teamAmount; 
  return true;
};

Data.prototype.getTeamAmount = function (crawlId) {
  if (!this.pollExists(crawlId)) {
    return null;
  }
  return this.polls[crawlId].teamAmount; 
};

Data.prototype.setTeams = function (crawlId, teams) {
  if (!this.pollExists(crawlId)) {
    return null;
  }
  this.polls[crawlId].teams = teams; 
  return true};


Data.prototype.getUILabels = function (lang) {
  //check if lang is valid before trying to load the dictionary file
  if (!["en", "sv"].some( el => el === lang))
    lang = "en";
  const labels = readFileSync("./server/data/labels-" + lang + ".json");
  return JSON.parse(labels);
}

Data.prototype.createCrawl = function(crawlId, lang="en") {
  if (!this.pollExists(crawlId)) {
    let poll = {};
    poll.lang = lang;  
    poll.mode = '';
    poll.city = '';
    poll.teamAmount = '';
    poll.teams = [];
    poll.participants = [];
    poll.submittedTasks = [];             
    this.polls[crawlId] = poll;
    poll.taskList = [];
    poll.round = 1;
    poll.chosenPubs = [];
    console.log("poll created", crawlId, poll);
  }
  return this.polls[crawlId];
}

Data.prototype.getPoll = function(crawlId) {
  if (this.pollExists(crawlId)) {
    return this.polls[crawlId];
  }
  return {};
}

Data.prototype.participateInPoll = function(crawlId, name) {
  console.log("participant will be added to", crawlId, name);
  if (this.pollExists(crawlId)) {
    this.polls[crawlId].participants.push({name: name, team:'', arrived: false, admin: false})
  }
}

Data.prototype.getParticipants = function(crawlId) {
  const poll = this.polls[crawlId];
  console.log("participants requested for", crawlId);
  if (this.pollExists(crawlId)) { 
    return this.polls[crawlId].participants
  }
  return [];
}

Data.prototype.setChosenPub = function(crawlId, chosenPub) {
  if (!this.pollExists(crawlId)) {
    return false;
  }
  this.polls[crawlId].chosenPub = chosenPub;
  console.log("Chosen pub set to:", chosenPub, "for crawlId:", crawlId);
  return true;
};

Data.prototype.setChosenPubs = function(crawlId, teamNumber, chosenPub) {
  console.log("team ", teamNumber, "have been assigned to ", chosenPub);
  if (this.pollExists(crawlId)) {
    const existingTeamIndex = this.polls[crawlId].chosenPubs.findIndex(
      pub => pub.teamNumber === teamNumber
    );
    if (existingTeamIndex !== -1) {
      this.polls[crawlId].chosenPubs[existingTeamIndex].chosenPub = chosenPub;} 
    else {
      this.polls[crawlId].chosenPubs.push({teamNumber: teamNumber, chosenPub: chosenPub});}
  }
};

Data.prototype.getChosenPubs = function(crawlId) {
  if (!this.pollExists(crawlId)) {
    return null;
  }
  return this.polls[crawlId].chosenPubs;
};

Data.prototype.updateRound = function (crawlId) {
  if (!this.pollExists(crawlId)) {
    return false;
  }
  this.polls[crawlId].round += 1; 
  return true
}

Data.prototype.getRound = function (crawlId) {
  if (!this.pollExists(crawlId)) {
    return null;
  }
  return this.polls[crawlId].round; 
};

Data.prototype.addQuestion = function(crawlId, q) {
  if (this.pollExists(crawlId)) {
    this.polls[crawlId].questions.push(q);
  }
}

Data.prototype.activateQuestion = function(crawlId, qId = null) {
  if (this.pollExists(crawlId)) {
    const poll = this.polls[crawlId];
    if (qId !== null) {
      poll.currentQuestion = qId;
    }
    return poll.questions?.[poll.currentQuestion];
  }
  return {}
}

Data.prototype.getSubmittedAnswers = function(crawlId) {
  if (this.pollExists(crawlId)) {
    const poll = this.polls[crawlId];
    const answers = poll.answers?.[poll.currentQuestion];
    if (typeof poll.questions?.[poll.currentQuestion] !== 'undefined') {
      return answers;
    }
  }
  return {}
}

Data.prototype.submitAnswer = function(crawlId, answer) {
  if (this.pollExists(crawlId)) {
    const poll = this.polls[crawlId];
    let answers = poll.answers?.[poll.currentQuestion];
    // create answers object if no answers have yet been submitted
    if (typeof answers !== 'object') {
      answers = {};
      answers[answer] = 1;
      poll.answers.push(answers);
    }
    // create answer property if that specific answer has not yet been submitted
    else if (typeof answers[answer] === 'undefined') {
      answers[answer] = 1;
    }
    // if the property already exists, increase the number
    else
      answers[answer] += 1
    console.log("answers looks like ", answers, typeof answers);
  }

}

Data.prototype.initializeTasks = function(crawlId, tasks) {
  if (!this.pollExists(crawlId)) {
    return false;
  }
  // Chat
  const tasksWithChecked = tasks.map(task => ({
    ...task,
    checked: task.checked || false,
    completedBy: task.completedBy || null
  }));
  this.polls[crawlId].taskList = tasksWithChecked;
  return this.getTasks(crawlId);
};

Data.prototype.addTask = function(crawlId, task) {
  if (!this.pollExists(crawlId)) {
    return false;
  }
  // Chat
  const taskWithChecked = {
    ...task,
    checked: false,
    completedBy: null
  };
  this.polls[crawlId].taskList.push(taskWithChecked);
  return this.getTasks(crawlId);
};

Data.prototype.updateTaskStatus = function(crawlId, taskText, checked, teamNumber) { 
  if (!this.pollExists(crawlId)) {
    return false;
  }
  const task = this.polls[crawlId].taskList.find(t => t.text === taskText);
  if (task) {
    task.checked = checked;
    // CHAT
    if (checked) {
      task.completedBy = teamNumber;
      console.log(`Server: Task "${taskText}" completed by team: ${teamNumber}`);
    } else if (!checked) {
      task.completedBy = null;
      console.log(`Server: Task "${taskText}" unchecked`);
    }
  }
  return this.getTasks(crawlId);
};

Data.prototype.getTasks = function(crawlId) {
  if (!this.pollExists(crawlId)) {
    return [];
  }
  return this.polls[crawlId].taskList || [];
};

Data.prototype.initializeScores = function(crawlId) {
  if (!this.pollExists(crawlId)) {
    return false;
  }
  //Chat
  if (!this.polls[crawlId].scores) {
    this.polls[crawlId].scores = [0, 0, 0, 0, 0]; // Initialize scores for 5 teams
  }
  return this.polls[crawlId].scores;
};

Data.prototype.updateScores = function(crawlId, scores) {
  if (!this.pollExists(crawlId)) {
    return false;
  }
  this.polls[crawlId].scores = scores;
  return this.polls[crawlId].scores;
};

Data.prototype.getScores = function(crawlId) {
  if (!this.pollExists(crawlId)) {
    return null;
  }
  if (!this.polls[crawlId].scores) {
    return this.initializeScores(crawlId);
  }
  return this.polls[crawlId].scores;
};


export { Data };



