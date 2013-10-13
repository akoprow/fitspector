'use strict'

express = require 'express'
passport = require 'passport'

routes = require './server/routes'
runkeeper = require './server/runkeeper'

####################################################################################################
# Configure
####################################################################################################

app = express()
app.configure ->
  app.use express.compress()
  app.use express.cookieParser()
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.static(__dirname + '/client')
  app.use express.cookieSession(
    # TODO(koper) Make sure this does not need to be secure
    secret: process.env.COOKIE_SECRET || "top-secret"
  )
  app.use passport.initialize()
  app.use passport.session()
  app.use app.router

####################################################################################################
# Configure Passport
####################################################################################################

passport.use runkeeper.runKeeperStrategy()

passport.serializeUser runkeeper.serializeUser
passport.deserializeUser runkeeper.deserializeUser

####################################################################################################
# Routes
####################################################################################################

app.get '/auth/runkeeper', passport.authenticate 'runkeeper'

app.get '/auth/runkeeper/callback',
  passport.authenticate('runkeeper', { failureRedirect: '/login' }),
  (req, res) -> res.redirect '/'

app.post '/logout',
  (req, res) ->
    req.logout()
    res.send 200

app.get '/', routes.index
app.get '/views/:name', routes.partials

# redirect all other requests to the index (HTML5 history)
app.get '*', routes.index

####################################################################################################
# Staring server
####################################################################################################

port = process.env.PORT or 8080
app.listen port, ->
  console.log 'Listening on ' + port
