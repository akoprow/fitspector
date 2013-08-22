var express = require('express');
var server = express.createServer();

server.use(express.compress());

server.configure('production', function () {
  server.use(function (req, res, next) {
    var schema = (req.headers['x-forwarded-proto'] || '').toLowerCase();
    if (schema === 'https') {
      next();
    } else {
      res.redirect('https://' + req.headers.host + req.url);
    }
  });
});

server.configure(function() {
  server.use(express.static(__dirname + '/public'));
});

var port = process.env.PORT || 8080;
server.listen(port);
