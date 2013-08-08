var express = require('express');
var server = express.createServer();

server.configure(function() {
  server.use(express.static(__dirname + '/public'));
});

var port = process.env.PORT || 8080;
server.listen(port);
