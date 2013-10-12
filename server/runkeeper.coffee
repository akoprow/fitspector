logger = require './utils/logger'
passport = require 'passport'
request = require 'request'
string = require 'string'
RunKeeperStrategy = require('passport-runkeeper').Strategy

####################################################################################################

RUNKEEPER_API_URL = 'https://api.runkeeper.com/'

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
      path: 'user'
      accept: 'application/vnd.com.runkeeper.User+json'

    userActivities:
      path: 'fitnessActivities?pageSize=1000'
      accept: 'application/vnd.com.runkeeper.FitnessActivityFeed+json'

    profile:
      path: 'profile'
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

createRunKeeperUser = (id, token, done) ->
  logger.warn 'createRunKeeperUser | id: %j | token: %j', id, token

  createUser = (err, profile) ->
    logger.warn 'createUser | %j', profile
    return done err if err
    user =
      id: id
      name: profile.name
      isMale: profile.gender is 'M'
      birthday: new Date(profile.birthday)
      smallImgUrl: profile['medium_picture']
    logger.warn '  createdUser --> | %j', user
    done null, user

  runKeeper.get token, runKeeper.api.profile, createUser

####################################################################################################

loadRunKeeperUser = (id, token, done) ->
  logger.warn 'loadRunKeeperUser | id: %j', id
  # TODO(koper) Implement... for now we always create a new user
  createRunKeeperUser id, token, done

####################################################################################################

module.exports =
  runKeeperStrategy: ->
    config =
      clientID: runKeeper.clientId
      clientSecret: runKeeper.secret
      callbackURL: runKeeper.callbackURL

    callback = (token, tokenSecret, profile, done) ->
      logger.warn 'RunKeeper callback | token: %j | tokenSecret: %j | profile: %j',
        token, tokenSecret, profile
      userId = 'RKU' + profile.id
      loadRunKeeperUser userId, token, done

    return new RunKeeperStrategy config, callback

  serializeUser: (user, done) ->
    done null, user.id

  deserializeUser: (id, done) ->
    user =
      switch
        when isRunKeeperId id then loadRunKeeperUser id
        else null
    done null, user
