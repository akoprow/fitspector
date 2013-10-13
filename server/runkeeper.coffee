logger = require './utils/logger'
passport = require 'passport'
request = require 'request'
string = require 'string'
Firebase = require 'firebase'
RunKeeperStrategy = require('passport-runkeeper').Strategy
User = require '../client/scripts/models/user'

####################################################################################################

RUNKEEPER_API_URL = 'https://api.runkeeper.com'
FIREBASE_URL = 'https://fitspector.firebaseIO.com'

####################################################################################################

requestCallback = (cb) ->
  (err, res, body) ->
    if not err and res.statusCode == 200
      cb null, body
    else
      cb err

####################################################################################################

runKeeper =
  api:
    accessToken:
      uri: 'https://runkeeper.com/apps/token'

    userInfo:
      path: '/user'
      accept: 'application/vnd.com.runkeeper.User+json'

    userActivities:
      path: '/fitnessActivities?pageSize=1000'
      accept: 'application/vnd.com.runkeeper.FitnessActivityFeed+json'

    profile:
      path: '/profile'
      accept: 'application/vnd.com.runkeeper.Profile+json'

  callbackURL: process.env.RUN_KEEPER_CALLBACK_URL ||
    throw new Error 'Missing RUN_KEEPER_CALLBACK_URL'
  clientId: process.env.RUN_KEEPER_ID || throw new Error 'Missing RUN_KEEPER_ID'
  secret: process.env.RUN_KEEPER_SECRET || throw new Error 'Missing RUN_KEEPER_SECRET'

  get: (accessToken, config, cb) ->
    opts =
      url: RUNKEEPER_API_URL + config.path
      json: {}
      headers:
        Authorization: 'Bearer ' + accessToken
        Accept: config.accept

    request.get opts, requestCallback cb

####################################################################################################

isRunKeeperId = (id) ->
  string(id).startsWith 'RKU'

####################################################################################################

createRunKeeperUser = (userId, token, done) ->
  logger.warn 'createRunKeeperUser | id: %d | token: %d', userId, token

  createUser = (err, profile) ->
    logger.warn 'createUser | %j', profile
    return done err if err
    return done 'Missing user profile' if not profile?
    user = User.fromRunKeeperProfile profile
    new Firebase("#{FIREBASE_URL}/users").child(userId).child('profile').update user
    logger.warn '  createdUser --> | %j', user
    done null, user

  runKeeper.get token, runKeeper.api.profile, createUser

####################################################################################################

loadRunKeeperUser = (userId, token, done) ->
  logger.warn 'loadRunKeeperUser | id: %d', userId

  loadUser = (userProfile) ->
    user = userProfile.val()
    logger.warn 'user read from DB: %j', user
    if user?
      done null, user
    else
      createRunKeeperUser userId, token, done

  noUser = ->
    logger.warn 'no user read from DB'
    createRunKeeperUser userId, token, done

  new Firebase("#{FIREBASE_URL}/users").child(userId).child('profile').once 'value', loadUser, noUser

####################################################################################################

module.exports =
  runKeeperStrategy: ->
    config =
      clientID: runKeeper.clientId
      clientSecret: runKeeper.secret
      callbackURL: runKeeper.callbackURL

    callback = (token, tokenSecret, profile, done) ->
      logger.warn 'RunKeeper callback | token: %d | tokenSecret: %d | profile: %j',
        token, tokenSecret, profile
      userId = 'RKU' + profile.id
      loadRunKeeperUser userId, token, done

    return new RunKeeperStrategy config, callback

  serializeUser: (user, done) ->
    done null, user.id

  deserializeUser: (id, done) ->
    switch
      when isRunKeeperId id then loadRunKeeperUser id, undefined, done
      else done "Unknown user ID: #{id}"
