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

  socket.on('joinPoll', function(crawlId) {
    socket.join(crawlId);
    socket.emit('questionUpdate', data.activateQuestion(crawlId))
    socket.emit('submittedAnswersUpdate', data.getSubmittedAnswers(crawlId));
  });

  socket.on('participateInPoll', function(d) {
    data.participateInPoll(d.crawlId, d.name);
    io.to(d.crawlId).emit('participantsUpdate', data.getParticipants(d.crawlId));
  });
  socket.on('startPoll', function(crawlId) {
    io.to(crawlId).emit('startPoll');
  })
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
  
}

export { sockets };