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
  };
  this.polls['test'] = {
    lang: "en",
    participants: [],
    selectedPubs: [],
    mode:'',
    city:'',
    teamAmount: '',
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
    poll.participants = [];             
    this.polls[crawlId] = poll;
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

Data.prototype.participateInPoll = function(crawlId, name, socketId) {
  console.log("participant will be added to", crawlId, name);
  if (this.pollExists(crawlId)) {
    this.polls[crawlId].participants.push({name: name, team:'', arrived: false, admin: false, id: socketId})
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

Data.prototype.getCurrentParticipant = function(crawlId, socketId) {
  if (this.pollExists(crawlId)) {
    return this.polls[crawlId].participants.find(participant => participant.id === socketId) || null;
  }
  return null;
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

export { Data };



