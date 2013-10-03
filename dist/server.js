(function() {
  "use strict";
  var api, app, express, index, port;

  express = require("express");

  index = require("./routes/index");

  api = require("./routes/api");

  app = express();

  app.configure(function() {
    app.use(express.compress());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express["static"](__dirname + '/app'));
    return app.use(app.router);
  });

  app.get("/", index.index);

  app.get("/views/:name", index.partials);

  app.get("/api/login_rk/:code", api.loginRK);

  app.get("*", index.index);

  port = process.env.PORT || 8080;

  app.listen(port, function() {
    return console.log("Listening on " + port);
  });

}).call(this);
