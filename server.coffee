"use strict"

express = require "express"
index = require "./routes/index"
api = require "./routes/api"

# Configure
app = express()
app.configure ->
  app.use express.compress()
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.static(__dirname + '/app')
  app.use app.router


# Routes
app.get "/", index.index
app.get "/views/:name", index.partials

# JSON API
app.get "/api/login_rk/:code", api.loginRK

# redirect all other requests to the index (HTML5 history)
app.get "*", index.index

# Listen
port = process.env.PORT or 8080
app.listen port, ->
  console.log "Listening on " + port
