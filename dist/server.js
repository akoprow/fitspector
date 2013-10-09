(function() {
  "use strict";
  var User, api, app, express, passport, port, routes;

  express = require('express');

  passport = require('passport');

  routes = require('./server/routes');

  api = require('./server/api');

  User = require('./server/models/user');

  app = express();

  app.configure(function() {
    app.use(express.compress());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express["static"](__dirname + '/client'));
    return app.use(app.router);
  });

  passport.use(User.runKeeperStrategy());

  passport.serializeUser(User.serializeUser);

  passport.deserializeUser(User.deserializeUser);

  app.get("/", routes.index);

  app.get("/views/:name", routes.partials);

  app.get("*", routes.index);

  port = process.env.PORT || 8080;

  app.listen(port, function() {
    return console.log("Listening on " + port);
  });

}).call(this);
