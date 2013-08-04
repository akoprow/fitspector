var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  response.send(
      fs.readFileSync('index.html')
	  .toString('utf-8'));
});

app.get('/calendar', function(request, response) {
  response.send(
      fs.readFileSync('calendar.html')
	  .toString('utf-8'));
});

app.get('/js/vis-calendar.js', function(request, response) {
  response.send(
      fs.readFileSync('js/vis-calendar.js')
	  .toString('utf-8'));
});

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
