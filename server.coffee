"use strict"

express = require "express"
routes = require './server/routes'
api = require './server/api'

# Configure
app = express()
app.configure ->
  app.use express.compress()
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.static(__dirname + '/client')
  app.use app.router

# Routes
app.get "/", routes.index
app.get "/views/:name", routes.partials

# redirect all other requests to the index (HTML5 history)
app.get "*", routes.index

# Listen
port = process.env.PORT or 8080
app.listen port, ->
  console.log "Listening on " + port
