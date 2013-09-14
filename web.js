var express = require('express');
var server = express.createServer();

server.use(express.compress());

server.configure(function() {
  server.use(function(req, res, next) {
    if (req.url.indexOf('/img/') === 0) {
      res.setHeader("Cache-Control", "max-age = 31556926"); // cache for a year
    }
    return next();
  });

  server.use(express.static(__dirname + '/public'));
});

var port = process.env.PORT || 8080;
server.listen(port);
