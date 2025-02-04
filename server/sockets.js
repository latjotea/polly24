function sockets(io, socket, data) {
  
  socket.on('getUILabels', function(lang) {
    socket.emit('uiLabels', data.getUILabels(lang));
  });

  socket.on('createCrawl', function(d) {
    data.createCrawl(d.crawlId, d.lang)
    socket.emit('pollData', data.getCrawl(d.crawlId));
  });


  socket.on('joinCrawl', function(id) {
    socket.join(id);
    
  });

  socket.on('participateInCrawl', function(d) {
    data.participateInCrawl(d.crawlId, d.name, d.admin);
    io.to(d.crawlId).emit('participantsUpdate', data.getParticipants(d.crawlId));
  });


  socket.on('sendSelectedPubs', function(d) {
    console.log("sendselectedpubs");
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
    const existingTasks = data.getTasks(d.crawlId);
    if (!existingTasks || existingTasks.length === 0) {
      data.initializeTasks(d.crawlId, d.tasks);
    }
    io.to(d.crawlId).emit("taskListUpdated", data.getTasks(d.crawlId));
  });

  socket.on("addTask", function(d) {
    data.addTask(d.crawlId, d.task);
    io.to(d.crawlId).emit("taskListUpdated", data.getTasks(d.crawlId));
  });

  socket.on("updateTaskStatus", function(d) {
    const updatedTasks= data.updateTaskStatus(d.crawlId, d.taskId, d.checked, d.teamNumber);
    io.to(d.crawlId).emit("taskListUpdated", updatedTasks);
  });

  socket.on("getTasks", function(d) {
    const tasks = data.getTasks(d.crawlId);
    socket.emit("taskListUpdated", tasks);
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
    io.to(d.crawlId).emit("crawlEnded")
    data.endCrawl(d.crawlId);
    
    console.log(d.activeCrawls)
  });
}

export { sockets };