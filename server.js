'use strict';

var express = require('express');
var index = require('./routes/index');
var api = require('./routes/api');

// Configure
var app = express();

app.configure(function() {
  app.use(express.compress());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/app'));
  // TODO(koper) This needs to be removed; at least in prod.
  app.use(express.static(__dirname + '/libs'));
  app.use(app.router);
});

// Routes
app.get('/', index.index);
app.get('/views/:name', index.partials);

// JSON API
app.get('/api/login_rk/:code', api.loginRK);

// redirect all other requests to the index (HTML5 history)
app.get('*', index.index);

// Listen
var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log('Listening on ' + port);
});
