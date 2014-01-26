(function() {
  'use strict';
  var app, deserializeUser, express, passport, port, routes, runKeeper, serializeUser;

  express = require('express');

  passport = require('passport');

  routes = require('./server/routes');

  runKeeper = require('./server/runkeeper');

  app = express();

  app.configure(function() {
    app.use(express.logger('dev'));
    app.use(express.compress());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use('/fonts', express["static"](__dirname + '/client/fonts'));
    app.use('/images', express["static"](__dirname + '/client/images'));
    app.use('/scripts', express["static"](__dirname + '/client/scripts'));
    app.use('/styles', express["static"](__dirname + '/client/styles'));
    app.use('/views', express["static"](__dirname + '/client/views'));
    app.use('/libs', express["static"](__dirname + '/client/libs'));
    app.use(express.cookieSession({
      secret: process.env.COOKIE_SECRET || 'top-secret'
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    return app.use(app.router);
  });

  passport.use(runKeeper.runKeeperStrategy());

  serializeUser = function(user, done) {
    return done(null, user.id);
  };

  deserializeUser = function(id, done) {
    switch (false) {
      case !runKeeper.isRunKeeperId(id):
        return runKeeper.loadRunKeeperUser(id, done);
      default:
        return done('Unknown user ID: #{id}');
    }
  };

  passport.serializeUser(serializeUser);

  passport.deserializeUser(deserializeUser);

  app.get('/auth/runkeeper', passport.authenticate('runkeeper'));

  app.get('/auth/runkeeper/callback', passport.authenticate('runkeeper', {
    successRedirect: '/workouts',
    failureRedirect: '/loginFailed'
  }));

  app.post('/logout', function(req, res) {
    req.logout();
    return res.send(200);
  });

  app.get('/', routes.index);

  app.get('*', routes.index);

  port = process.env.PORT || 8080;

  app.listen(port, function() {
    return console.log('Listening on ' + port);
  });

}).call(this);
