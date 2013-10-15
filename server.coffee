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
  app.use express.logger 'dev'
  app.use express.compress()
  app.use express.cookieParser()
  app.use express.bodyParser()
  app.use express.methodOverride()
  # TODO(koper) Duh, there must be a way of serving just the top-level dir
  app.use '/fonts', express.static(__dirname + '/client/fonts')
  app.use '/images', express.static(__dirname + '/client/images')
  app.use '/scripts', express.static(__dirname + '/client/scripts')
  app.use '/styles', express.static(__dirname + '/client/styles')
  # TODO(koper) Libs are not needed in 'prod'
  app.use '/libs', express.static(__dirname + '/client/libs')
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
