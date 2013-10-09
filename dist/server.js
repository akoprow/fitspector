(function() {
  "use strict";
  var api, app, express, port, routes;

  express = require("express");

  routes = require('./server/routes');

  api = require('./server/api');

  app = express();

  app.configure(function() {
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express["static"](__dirname + '/client'));
    return app.use(app.router);
  });

  app.get("/", routes.index);

  app.get("/views/:name", routes.partials);

  app.get("*", routes.index);

  port = process.env.PORT || 8080;

  app.listen(port, function() {
    return console.log("Listening on " + port);
  });

}).call(this);
