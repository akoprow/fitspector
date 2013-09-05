var express = require('express');
var app = express.createServer();

app.use(express.compress());

app.configure(function() {
  app.use(function(req, res, next) {
    if (req.url.indexOf('/images/') === 0) {
      res.setHeader("Cache-Control", "max-age = 31556926"); // cache for a year
    }
    return next();
  });

  app.use(express.static(__dirname + '/app'));
});

var port = process.env.PORT || 8080;
app.listen(port);

module.exports = app;
