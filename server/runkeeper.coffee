###################################################################################################
# Interface to RunKeeper
#
# Author: Adam Koprowski
####################################################################################################
'use strict'

# TODO!!!(koper) This badly needs to be re-factored.  RunKeeper logic should stay here, dependency
# on Storage should be removed and a new module should be created that would coordinate the two.

async = require 'async'
logger = require './utils/logger'
passport = require 'passport'
request = require 'request'
string = require 'string'
_ = require 'underscore'
RunKeeperStrategy = require('passport-runkeeper').Strategy

Distance = require('../client/scripts/models/distance').Distance
Time = require('../client/scripts/models/time').Time
User = require('../client/scripts/models/user').User
Zones = require('../client/scripts/models/zones').Zones

Storage = require('./storage')
ExerciseZones = require('./exerciseZones')

####################################################################################################

MAX_WORKOUTS_PROCESSED_AT_A_TIME = 20

RUNKEEPER_API_URL = 'https://api.runkeeper.com'

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

    activityDetails: (uri) ->
      path: uri
      accept: 'application/vnd.com.runkeeper.FitnessActivity+json'

    profile:
      path: '/profile'
      accept: 'application/vnd.com.runkeeper.Profile+json'

  callbackURL: process.env.RUN_KEEPER_CALLBACK_URL ||
    throw new Error 'Missing RUN_KEEPER_CALLBACK_URL'
  clientId: process.env.RUN_KEEPER_ID || throw new Error 'Missing RUN_KEEPER_ID'
  secret: process.env.RUN_KEEPER_SECRET || throw new Error 'Missing RUN_KEEPER_SECRET'

  get: (accessToken, config, cb) ->
    logger.debug 'RunKeeper GET at %s (type: %s)', config.path, config.accept
    opts =
      url: RUNKEEPER_API_URL + config.path
      json: {}
      headers:
        Authorization: 'Bearer ' + accessToken
        Accept: config.accept

    request.get opts, requestCallback cb

####################################################################################################

runKeeperWorkoutType = (type, note) ->
  switch type
    when 'Boxing / MMA' then 'box'
    when 'CrossFit', 'Strength Training', 'Circuit Training', 'Core Strengthening', 'Bootcamp' then 'wtr'
    when 'Cross-Country Skiing' then 'xcs'
    when 'Cycling', 'Mountain Biking', 'Spinning' then 'bik'
    when 'Downhill Skiing' then 'ski'
    when 'Rowing' then 'row'
    when 'Running' then 'run'
    when 'Swimming' then 'swi'
    when 'Walking', 'Hiking' then 'hik'
    when 'Yoga' then 'yog'
    when 'Dance', 'Zumba', 'Barre', 'Pilates' then 'oth'
    when 'Elliptical', 'Wheelchair', 'Snowboarding', 'Skating', 'Sports', 'Snowboarding', 'Skating' then 'oth'
    when 'Group Workout', 'Meditation', 'Arc Trainer', 'Stairmaster / Stepwell', 'Nordic Walking' then 'oth'
    when 'Other'
      switch note.trim().toLowerCase()
        when 'volleyball' then 'vlb'
        else 'oth'
    else
      logger.error 'Unknown RunKeeper workout type', type
      'oth'

####################################################################################################

isRunKeeperId = (id) ->
  string(id).startsWith 'RKU'

####################################################################################################

addWorkout = (accessToken, user, workouts, data, cb) ->
  prefix = '/fitnessActivities/'
  unless string(data.uri).startsWith(prefix)
    cb 'Cannot get activity ID from its URI: ' + data.uri
    return
  workoutId = 'RKW' + string(data.uri).chompLeft(prefix).toString()

  # We already have this workout
  if workouts and workouts[workoutId]
    cb null, 0
    return

  activityDetailsConfig = runKeeper.api.activityDetails data.uri
  runKeeper.get accessToken, activityDetailsConfig, (err, response) ->
    if err
      logger.error "Import error for user: #{user.id}, error: #{err}"
      return
    if !response
      logger.error "Empty detailed workout response for exercise: #{data.uri}"
      return

    # TODO(koper) Handle errors...
    # Split notes over lines
    noteLines = response.notes?.match /^.*((\r\n|\n|\r)|$)/gm
    noteLines ?= []
    labels = []
    if noteLines.length > 0 and string(_.last noteLines).startsWith '#'
      lastLine = noteLines.pop()
      labels = lastLine.match /\#([\w-]+)/g
      # Drop leading '#' from labels.
      labels = _(labels).map (s) -> string(s).chompLeft('#').toString()

    workout =
      source:
        runKeeper: response.activity
      exerciseType: runKeeperWorkoutType response.type, noteLines[0] || ''
      startTime: response['start_time']
      notes: noteLines.join '\n'
      avgHR: response['average_heart_rate']
      labels: labels

      totalCalories: response['total_calories']
      totalDistance: response['total_distance']
      totalDuration: response.duration
      totalElevation: response.climb

    workout.hrZones = ExerciseZones.computeHrZones {
      user: user
      totalDuration: workout.totalDuration
      hrData: response['heart_rate']
    }

    workout.paceZones = ExerciseZones.computePaceZones {
      user: user
      exerciseType: workout.exerciseType
      totalDistance: workout.totalDistance
      distanceData: response.distance
    }

    workout.elevationZones = ExerciseZones.computeElevationZones {
      user: user
      distanceData: response.distance
      pathData: response.path
    }

    # Delete undefined properties (Firebase does not like them)
    for own key, value of workout
      if not value?
        delete workout[key]

    # Note workout ID and save workout data.
    Storage.addWorkout user.id, workoutId, workout
    logger.info 'Processed workout %s into: %j', workoutId, workout
    cb null, 1

####################################################################################################

loadAllWorkouts = (userJson, accessToken) ->
  user = new User(userJson)
  logger.info 'Fetching all workouts for user: %s', user.id
  Storage.setImportCount user.id, 0  # We just mark that import is in progress; proper count set below.
  Storage.getAllUserWorkouts user.id, (workouts) ->
    runKeeper.get accessToken, runKeeper.api.userActivities, (err, response) ->
      Storage.setImportCount user.id, response.items.length, (err) ->
        logger.info 'Existing workouts: %j, RunKeeper error: %j, RunKeeper response: %j', workouts, err, response
        addWorkoutAux = (data, cb) ->
          newCb = (err, results) ->
            Storage.markImportItemComplete user.id
            cb(err, results)
          addWorkout accessToken, user, workouts, data, newCb
        cb = (err, data) ->
          total = _.reduce(data, ((x, y) -> x + y), 0)
          Storage.importFinished user.id, total
          if err
            logger.error 'Error while importing workouts for: %s -> %j', user.id, err
          else
            logger.info 'Imported %d new exercises for %s', total, user.id

        async.mapLimit response.items, MAX_WORKOUTS_PROCESSED_AT_A_TIME, addWorkoutAux, cb

####################################################################################################

createRunKeeperUser = (userId, token, done) ->

  createUser = (err, profile) ->
    return done err if err
    return done 'Missing user profile' if not profile?

    user = User.jsonUserFromRunKeeperProfile profile, userId
    user.joinedAt = new Date()

    Storage.updateUserProfile userId, user
    logger.warn 'Created new user profile: %j', user
    done null, user

  success = -> runKeeper.get token, runKeeper.api.profile, createUser
  failure = ->
    logger.warn 'Unauthorized access: %s', userId
    done null, false, { message: 'Unauthorized access.' }
  Storage.canCreateUser userId, success, failure

####################################################################################################

# TODO(koper) Token should not be passed as a parameter here.
loadRunKeeperUser = (userId, done, token) ->

  finishLoading = (err, user, msg) ->
    if user
      user.token = Storage.generateFirebaseToken user.id

    # Invoke the callback
    done err, user, msg

    if user
      # Mark login
      Storage.logLogin userId
      # and then asynchronously load all user's workouts
      loadAllWorkouts user, token if token? # provided we have the token

  loadUser = (user) ->
    logger.warn 'user read from DB: %j', user
    if user?
      finishLoading null, user
    else
      createRunKeeperUser userId, token, finishLoading

  noUser = ->
    logger.warn 'no user read from DB'
    createRunKeeperUser userId, token, finishLoading

  Storage.getUserProfile userId, loadUser, noUser

####################################################################################################

module.exports =
  runKeeperStrategy: ->
    config =
      clientID: runKeeper.clientId
      clientSecret: runKeeper.secret
      callbackURL: runKeeper.callbackURL

    callback = (token, tokenSecret, profile, done) ->
      userId = 'RKU' + profile.id
      loadRunKeeperUser userId, done, token

    return new RunKeeperStrategy config, callback

  isRunKeeperId: isRunKeeperId

  loadRunKeeperUser: loadRunKeeperUser
