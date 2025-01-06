function sockets(io, socket, data) {
  
  socket.on('getUILabels', function(lang) {
    socket.emit('uiLabels', data.getUILabels(lang));
  });

  socket.on('createCrawl', function(d) {
    data.createCrawl(d.crawlId, d.lang)
    socket.emit('pollData', data.getPoll(d.crawlId));
  });

  socket.on('addQuestion', function(d) {
    data.addQuestion(d.crawlId, {q: d.q, a: d.a});
    socket.emit('questionUpdate', data.activateQuestion(d.crawlId));
  });

  socket.on('joinPoll', function(id) {
    socket.join(id);
    
  });

  socket.on('participateInPoll', function(d) {
    data.participateInPoll(d.crawlId, d.name, d.admin);
    io.to(d.crawlId).emit('participantsUpdate', data.getParticipants(d.crawlId));
  });


  
  socket.on('runQuestion', function(d) {
    let question = data.activateQuestion(d.crawlId, d.questionNumber);
    io.to(d.crawlId).emit('questionUpdate', question);
    io.to(d.crawlId).emit('submittedAnswersUpdate', data.getSubmittedAnswers(d.crawlId));
  });

  socket.on('submitAnswer', function(d) {
    data.submitAnswer(d.crawlId, d.answer);
    io.to(d.crawlId).emit('submittedAnswersUpdate', data.getSubmittedAnswers(d.crawlId));
  }); 


  socket.on('sendSelectedPubs', function(d) {
    console.log("sendselectedpubs");
    console.log(d);
    data.setSelectedPubs(d.crawlId, d.selectedPubs);
    console.log('Valda pubar mottagna:', d.selectedPubs);
  });

  socket.on('getSelectedPubs', function(d) {
    console.log("Begäran om valda pubar mottagen.");
    socket.emit("selectedPubsResponse", data.getSelectedPubs(d.crawlId));
  });

  socket.on('setMode', function(d){
    data.setMode(d.crawlId, d.mode)
  });


  socket.on('getMode', function(d){
    socket.emit("selectedModeResponse", data.getMode(d.crawlId))

  });

  socket.on('setCity', function(d){
    data.setCity(d.crawlId, d.city)
  });


  socket.on('getCity', function(d){
    socket.emit("selectedCityResponse", data.getCity(d.crawlId))

  });
  

  socket.on('setTeamAmount', function(d){
    data.setTeamAmount(d.crawlId, d.teamAmount)
  });


  socket.on('getTeamAmount', function(d){
    socket.emit("selectedTeamAmountResponse", data.getTeamAmount(d.crawlId));
    socket.emit('participantsUpdate', data.getParticipants(d.crawlId));
  });

  socket.on('disconnect', () => {
    console.log(`Klient med socket.id ${socket.id} frånkopplad.`);
    // Lägg till logik för att ta bort deltagaren från data
  });

  socket.on("shuffleStarted", function(d){
    socket.emit("selectedTeamResponse", data.setTeams(d.crawlId, d.teams));
    io.to(d.crawlId).emit("receivedShuffleStarted", { crawlId: d.crawlId, teams: d.teams, participants:d.participants});
  });

  socket.on('goToNextPub', function(crawlId) {
    io.to(crawlId).emit('goToNextPub');
  });

  socket.on('getSubmittedTasks', function(d) {
    socket.emit("selectedSubmittedTasks", data.getSubmittedTasks(d.crawlId))
  });

  socket.on('setSubmittedTasks', function(d) {
    data.addSubmittedTask(d.crawlId, d.newTask);
    io.to(d.crawlId).emit("selectedSubmittedTasks", data.getSubmittedTasks(d.crawlId));
  });

  socket.on('updateRound', function(d){
    console.log("hej")
    data.updateRound(d.crawlId);
  });

  socket.on('getRound', function(d) {
    socket.emit("currentRoundResponse", data.getRound(d.crawlId));
  });

  socket.on('teamArrived', function(d) {
    io.to(d.teamNumber).emit("goToMap");
    data.setChosenPubs(d.crawlId, d.teamNumber, d.chosenPub)
    io.to(d.crawlId).emit("currentChosenPubsResponse", data.getChosenPubs(d.crawlId));
  });

  socket.on('getChosenPubs', function(d) {
    socket.emit("currentChosenPubsResponse", data.getChosenPubs(d.crawlId));
  });

  socket.on("initializeTasks", function(d) {
    data.initializeTasks(d.crawlId, d.tasks);
    io.to(d.crawlId).emit("taskListUpdated", data.getTasks(d.crawlId));
  });

  socket.on("addTask", function(d) {
    data.addTask(d.crawlId, d.task);
    io.to(d.crawlId).emit("taskListUpdated", data.getTasks(d.crawlId));
  });

  socket.on("updateTaskStatus", function(d) {
    data.updateTaskStatus(d.crawlId, d.taskText, d.checked, d.teamNumber);
    io.to(d.crawlId).emit("taskListUpdated", data.getTasks(d.crawlId));
  });

  socket.on("getTasks", function(d) {
    socket.emit("taskListUpdated", data.getTasks(d.crawlId));
  });

  socket.on("updateScores", function(d) {
      io.to(d.crawlId).emit("scoresUpdated", data.updateScores(d.crawlId, d.scores));
    });

  socket.on("getScores", function(d) {
      socket.emit("scoresUpdated", data.getScores(d.crawlId));
    });

  socket.on('checkActiveCrawl', function(d) { 
    const isActive = data.isActiveCrawl(d.crawlId);
    socket.emit('activeCrawlResponse', isActive);
  });
  
  socket.on('endCrawl', function(d) {
    const success = data.endCrawl(d.crawlId);
    if (success) {
      io.emit('crawlEnded', d.crawlId);
    }
  });
}

export { sockets };