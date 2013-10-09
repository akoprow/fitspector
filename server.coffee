'use strict'

express = require 'express'
passport = require 'passport'

routes = require './server/routes'

User = require './server/models/user'

# Configure
app = express()
app.configure ->
  app.use express.compress()
  app.use express.cookieParser()
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.static(__dirname + '/client')
  app.use app.router

# Configure Passport
passport.use User.runKeeperStrategy()

passport.serializeUser User.serializeUser
passport.deserializeUser User.deserializeUser

# Routes
app.get '/auth/runkeeper', passport.authenticate 'runkeeper'

app.get '/auth/runkeeper/callback',
  passport.authenticate('runkeeper', { failureRedirect: '/login' }),
  (req, res) -> res.redirect '/'

app.get '/', routes.index
app.get '/views/:name', routes.partials

# redirect all other requests to the index (HTML5 history)
app.get '*', routes.index

# Listen
port = process.env.PORT or 8080
app.listen port, ->
  console.log 'Listening on ' + port
