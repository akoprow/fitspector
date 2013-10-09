"use strict"

async = require 'async'
request = require 'request'
string = require 'string'
Firebase = require 'firebase'
_ = require 'underscore'

logger = require './utils/logger'

MAX_WORKOUTS_PROCESSED_AT_A_TIME = 20
RUNKEEPER_API_URL = "https://api.runkeeper.com/"


requestCallback = (cb) ->
  (err, res, body) ->
    cb null, body  if not err and res.statusCode is 200

runKeeper =
  api:
    accessToken:
      uri: "https://runkeeper.com/apps/token"

    userInfo:
      path: "user"
      accept: "application/vnd.com.runkeeper.User+json"

    userActivities:
      path: "fitnessActivities?pageSize=1000"
      accept: "application/vnd.com.runkeeper.FitnessActivityFeed+json"

    profile: (userInfo) ->
      path: userInfo.profile
      accept: "application/vnd.com.runkeeper.Profile+json"

  secret: process.env.RUNKEEPER_SECRET

  get: (accessToken, config, cb) ->
    opts =
      url: RUNKEEPER_API_URL + config.path
      json: {}
      headers:
        Authorization: "Bearer " + accessToken
        Accept: config.accept

    request.get opts, requestCallback cb

getToken = (input, callback) ->
  logger.debug "getToken | %j", input
  params =
    grant_type: "authorization_code"
    code: input.code
    client_id: "b459a206aced43729fc79026df108e60"
    client_secret: runKeeper.secret
    redirect_uri: "http://localhost:8080/login_rk"

  postOptions =
    uri: runKeeper.api.accessToken.uri
    form: params

  cb = requestCallback((err, body) ->
    accessToken = JSON.parse(body)["access_token"]
    callback null,
      accessToken: accessToken
  )
  request.post postOptions, cb


getUser = (input, callback) ->
  logger.debug "getUser | %j", input
  cb = (err, body) ->
    callback null,
      accessToken: input.accessToken
      userData: body

  runKeeper.get input.accessToken, runKeeper.api.userInfo, cb


getProfile = (input, callback) ->
  logger.debug "getProfile | %j", input
  cb = (err, body) ->
    callback null,
      accessToken: input.accessToken
      userData: input.userData
      profileData: body

  runKeeper.get input.accessToken, runKeeper.api.profile(input.userData), cb


mkUser = (input, callback) ->
  logger.debug "mkUser | %j", input
  userId = "RKU" + input.userData.userID
  user =
    name: input.profileData.name
    isMale: input.profileData.gender is "M"
    birthday: new Date(input.profileData.birthday)
    smallImgUrl: input.profileData["medium_picture"]

  usersRef = new Firebase("https://fitspector.firebaseIO.com/users")
  usersRef.child(userId).update user
  callback null,
    userId: userId
    accessToken: input.accessToken


runKeeperWorkoutType = (type) ->
  switch type
    when "Running"
      "run"
    when "Cycling"
      "bik"
    when "Mountain Biking"
      "bik"
    when "Walking"
      "hik"
    when "Hiking"
      "hik"
    when "Downhill Skiing"
      "ski"
    when "Cross-Country Skiing"
      "xcs"
    when "Swimming"
      "swi"
    when "Rowing"
      "row"
    when "Elliptical", "Wheelchair", "Snowboarding", "Skating", "Other"
      "oth"
    else
      log.error "Unknown RunKeeper workout type", type
      "oth"


addWorkout = (userRef, workoutIds, data, cb) ->
  prefix = "/fitnessActivities/"
  unless string(data.uri).startsWith(prefix)
    cb "Cannot get activity ID from its URI: " + data.uri
    return
  workoutId = "RKW" + string(data.uri).chompLeft(prefix).toString()
  
  # We already have this workout
  if workoutIds and workoutIds[workoutId]
    cb null, 0
    return

  workout =
    exerciseType: runKeeperWorkoutType(data.type)
    startTime: data["start_time"]
    totalDistance: data["total_distance"]
    totalDuration: data.duration
  
  # Note workout ID and save workout data.
  userRef.child("workoutIds").child(workoutId).set true
  userRef.child("workouts").child(workoutId).set workout
  logger.info "Processed workout ", workoutId, " -> ", workout
  cb null, 1


loadAllWorkouts = (userId, accessToken) ->
  logger.info "Fetching all workouts for user: ", userId, " with token: ", accessToken
  userRef = new Firebase("https://fitspector.firebaseIO.com/users").child(userId)
  userRef.child("workoutIds").once "value", (workoutIds) ->
    runKeeper.get accessToken, runKeeper.api.userActivities, (err, response) ->
      addWorkoutMap = _.partial(addWorkout, userRef, workoutIds.val())
      cb = (err, data) ->
        if err
          logger.error "Error while importing workouts for: ", userId, " -> ", err
        else
          total = _.reduce(data, ((x, y) -> x + y), 0)
          logger.info "Imported ", total, "new exercises for ", userId

      async.mapLimit response.items, MAX_WORKOUTS_PROCESSED_AT_A_TIME, addWorkoutMap, cb


exports.loginRK = (req, res) ->
  logger.log "info", "RunKeeper login request with code: " + req.params.code
  login = async.compose(mkUser, getProfile, getUser, getToken)
  login {code: req.params.code}, (err, data) ->
    response = userId: data.userId
    logger.info "Response: ", response
    res.send response
    loadAllWorkouts data.userId, data.accessToken
