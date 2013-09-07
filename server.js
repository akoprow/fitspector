var express = require('express');
var routes = require('./routes');

// Configure
var app = express();

app.configure(function() {
  app.use(express.compress());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/app'));
  app.use(app.router);
});

// Routes
app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API
// ...

// redirect all other requests to the index (HTML5 history)
app.get('*', routes.index);

// Listen

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log("Listening on " + port);
});
