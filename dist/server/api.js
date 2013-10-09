(function() {
  "use strict";
  var Firebase, MAX_WORKOUTS_PROCESSED_AT_A_TIME, RUNKEEPER_API_URL, addWorkout, async, getProfile, getToken, getUser, loadAllWorkouts, logger, mkUser, request, requestCallback, runKeeper, runKeeperWorkoutType, string, winston, _;

  async = require("async");

  request = require("request");

  string = require("string");

  winston = require("winston");

  Firebase = require("firebase");

  _ = require("underscore");

  MAX_WORKOUTS_PROCESSED_AT_A_TIME = 20;

  RUNKEEPER_API_URL = "https://api.runkeeper.com/";

  logger = new winston.Logger({
    transports: [
      new winston.transports.Console(), new winston.transports.File({
        filename: "fitspector.log"
      })
    ]
  });

  requestCallback = function(cb) {
    return function(err, res, body) {
      if (!err && res.statusCode === 200) {
        return cb(null, body);
      }
    };
  };

  runKeeper = {
    api: {
      accessToken: {
        uri: "https://runkeeper.com/apps/token"
      },
      userInfo: {
        path: "user",
        accept: "application/vnd.com.runkeeper.User+json"
      },
      userActivities: {
        path: "fitnessActivities?pageSize=1000",
        accept: "application/vnd.com.runkeeper.FitnessActivityFeed+json"
      },
      profile: function(userInfo) {
        return {
          path: userInfo.profile,
          accept: "application/vnd.com.runkeeper.Profile+json"
        };
      }
    },
    secret: process.env.RUNKEEPER_SECRET,
    get: function(accessToken, config, cb) {
      var opts;
      opts = {
        url: RUNKEEPER_API_URL + config.path,
        json: {},
        headers: {
          Authorization: "Bearer " + accessToken,
          Accept: config.accept
        }
      };
      return request.get(opts, requestCallback(cb));
    }
  };

  getToken = function(input, callback) {
    var cb, params, postOptions;
    logger.debug("getToken | %j", input);
    params = {
      grant_type: "authorization_code",
      code: input.code,
      client_id: "b459a206aced43729fc79026df108e60",
      client_secret: runKeeper.secret,
      redirect_uri: "http://localhost:8080/login_rk"
    };
    postOptions = {
      uri: runKeeper.api.accessToken.uri,
      form: params
    };
    cb = requestCallback(function(err, body) {
      var accessToken;
      accessToken = JSON.parse(body)["access_token"];
      return callback(null, {
        accessToken: accessToken
      });
    });
    return request.post(postOptions, cb);
  };

  getUser = function(input, callback) {
    var cb;
    logger.debug("getUser | %j", input);
    cb = function(err, body) {
      return callback(null, {
        accessToken: input.accessToken,
        userData: body
      });
    };
    return runKeeper.get(input.accessToken, runKeeper.api.userInfo, cb);
  };

  getProfile = function(input, callback) {
    var cb;
    logger.debug("getProfile | %j", input);
    cb = function(err, body) {
      return callback(null, {
        accessToken: input.accessToken,
        userData: input.userData,
        profileData: body
      });
    };
    return runKeeper.get(input.accessToken, runKeeper.api.profile(input.userData), cb);
  };

  mkUser = function(input, callback) {
    var user, userId, usersRef;
    logger.debug("mkUser | %j", input);
    userId = "RKU" + input.userData.userID;
    user = {
      name: input.profileData.name,
      isMale: input.profileData.gender === "M",
      birthday: new Date(input.profileData.birthday),
      smallImgUrl: input.profileData["medium_picture"]
    };
    usersRef = new Firebase("https://fitspector.firebaseIO.com/users");
    usersRef.child(userId).update(user);
    return callback(null, {
      userId: userId,
      accessToken: input.accessToken
    });
  };

  runKeeperWorkoutType = function(type) {
    switch (type) {
      case "Running":
        return "run";
      case "Cycling":
        return "bik";
      case "Mountain Biking":
        return "bik";
      case "Walking":
        return "hik";
      case "Hiking":
        return "hik";
      case "Downhill Skiing":
        return "ski";
      case "Cross-Country Skiing":
        return "xcs";
      case "Swimming":
        return "swi";
      case "Rowing":
        return "row";
      case "Elliptical":
      case "Wheelchair":
      case "Snowboarding":
      case "Skating":
      case "Other":
        return "oth";
      default:
        log.error("Unknown RunKeeper workout type", type);
        return "oth";
    }
  };

  addWorkout = function(userRef, workoutIds, data, cb) {
    var prefix, workout, workoutId;
    prefix = "/fitnessActivities/";
    if (!string(data.uri).startsWith(prefix)) {
      cb("Cannot get activity ID from its URI: " + data.uri);
      return;
    }
    workoutId = "RKW" + string(data.uri).chompLeft(prefix).toString();
    if (workoutIds && workoutIds[workoutId]) {
      cb(null, 0);
      return;
    }
    workout = {
      exerciseType: runKeeperWorkoutType(data.type),
      startTime: data["start_time"],
      totalDistance: data["total_distance"],
      totalDuration: data.duration
    };
    userRef.child("workoutIds").child(workoutId).set(true);
    userRef.child("workouts").child(workoutId).set(workout);
    logger.info("Processed workout ", workoutId, " -> ", workout);
    return cb(null, 1);
  };

  loadAllWorkouts = function(userId, accessToken) {
    var userRef;
    logger.info("Fetching all workouts for user: ", userId, " with token: ", accessToken);
    userRef = new Firebase("https://fitspector.firebaseIO.com/users").child(userId);
    return userRef.child("workoutIds").once("value", function(workoutIds) {
      return runKeeper.get(accessToken, runKeeper.api.userActivities, function(err, response) {
        var addWorkoutMap, cb;
        addWorkoutMap = _.partial(addWorkout, userRef, workoutIds.val());
        cb = function(err, data) {
          var total;
          if (err) {
            return logger.error("Error while importing workouts for: ", userId, " -> ", err);
          } else {
            total = _.reduce(data, (function(x, y) {
              return x + y;
            }), 0);
            return logger.info("Imported ", total, "new exercises for ", userId);
          }
        };
        return async.mapLimit(response.items, MAX_WORKOUTS_PROCESSED_AT_A_TIME, addWorkoutMap, cb);
      });
    });
  };

  exports.loginRK = function(req, res) {
    var login;
    logger.log("info", "RunKeeper login request with code: " + req.params.code);
    login = async.compose(mkUser, getProfile, getUser, getToken);
    return login({
      code: req.params.code
    }, function(err, data) {
      var response;
      response = {
        userId: data.userId
      };
      logger.info("Response: ", response);
      res.send(response);
      return loadAllWorkouts(data.userId, data.accessToken);
    });
  };

}).call(this);
