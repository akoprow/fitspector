(function() {
  'use strict';
  var Distance, ExerciseZones, MAX_WORKOUTS_PROCESSED_AT_A_TIME, RUNKEEPER_API_URL, RunKeeperStrategy, Storage, Time, User, Zones, addWorkout, async, createRunKeeperUser, isRunKeeperId, loadAllWorkouts, loadRunKeeperUser, logger, passport, request, requestCallback, runKeeper, runKeeperWorkoutType, string, _,
    __hasProp = {}.hasOwnProperty;

  async = require('async');

  logger = require('./utils/logger');

  passport = require('passport');

  request = require('request');

  string = require('string');

  _ = require('underscore');

  RunKeeperStrategy = require('passport-runkeeper').Strategy;

  Distance = require('../client/scripts/models/distance').Distance;

  Time = require('../client/scripts/models/time').Time;

  User = require('../client/scripts/models/user').User;

  Zones = require('../client/scripts/models/zones').Zones;

  Storage = require('./storage');

  ExerciseZones = require('./exerciseZones');

  MAX_WORKOUTS_PROCESSED_AT_A_TIME = 20;

  RUNKEEPER_API_URL = 'https://api.runkeeper.com';

  requestCallback = function(cb) {
    return function(err, res, body) {
      if (!err && res.statusCode === 200) {
        return cb(null, body);
      } else {
        return cb(err);
      }
    };
  };

  runKeeper = {
    api: {
      accessToken: {
        uri: 'https://runkeeper.com/apps/token'
      },
      userInfo: {
        path: '/user',
        accept: 'application/vnd.com.runkeeper.User+json'
      },
      userActivities: {
        path: '/fitnessActivities?pageSize=1000',
        accept: 'application/vnd.com.runkeeper.FitnessActivityFeed+json'
      },
      activityDetails: function(uri) {
        return {
          path: uri,
          accept: 'application/vnd.com.runkeeper.FitnessActivity+json'
        };
      },
      profile: {
        path: '/profile',
        accept: 'application/vnd.com.runkeeper.Profile+json'
      }
    },
    callbackURL: process.env.RUN_KEEPER_CALLBACK_URL || (function() {
      throw new Error('Missing RUN_KEEPER_CALLBACK_URL');
    })(),
    clientId: process.env.RUN_KEEPER_ID || (function() {
      throw new Error('Missing RUN_KEEPER_ID');
    })(),
    secret: process.env.RUN_KEEPER_SECRET || (function() {
      throw new Error('Missing RUN_KEEPER_SECRET');
    })(),
    get: function(accessToken, config, cb) {
      var opts;
      logger.debug('RunKeeper GET at %s (type: %s)', config.path, config.accept);
      opts = {
        url: RUNKEEPER_API_URL + config.path,
        json: {},
        headers: {
          Authorization: 'Bearer ' + accessToken,
          Accept: config.accept
        }
      };
      return request.get(opts, requestCallback(cb));
    }
  };

  runKeeperWorkoutType = function(type) {
    switch (type) {
      case 'Running':
        return 'run';
      case 'Cycling':
        return 'bik';
      case 'Mountain Biking':
        return 'bik';
      case 'Walking':
        return 'hik';
      case 'Hiking':
        return 'hik';
      case 'Downhill Skiing':
        return 'ski';
      case 'Cross-Country Skiing':
        return 'xcs';
      case 'Swimming':
        return 'swi';
      case 'Rowing':
        return 'row';
      case 'Elliptical':
      case 'Wheelchair':
      case 'Snowboarding':
      case 'Skating':
      case 'Other':
        return 'oth';
      default:
        log.error('Unknown RunKeeper workout type', type);
        return 'oth';
    }
  };

  isRunKeeperId = function(id) {
    return string(id).startsWith('RKU');
  };

  addWorkout = function(accessToken, user, workouts, data, cb) {
    var activityDetailsConfig, prefix, workoutId;
    prefix = '/fitnessActivities/';
    if (!string(data.uri).startsWith(prefix)) {
      cb('Cannot get activity ID from its URI: ' + data.uri);
      return;
    }
    workoutId = 'RKW' + string(data.uri).chompLeft(prefix).toString();
    if (workouts && workouts[workoutId]) {
      cb(null, 0);
      return;
    }
    activityDetailsConfig = runKeeper.api.activityDetails(data.uri);
    return runKeeper.get(accessToken, activityDetailsConfig, function(err, response) {
      var key, labels, lastLine, noteLines, value, workout, _ref;
      if (err) {
        logger.error("Import error for user: " + user.id + ", error: " + err);
        return;
      }
      if (!response) {
        logger.error("Empty detailed workout response for exercise: " + data.uri);
        return;
      }
      noteLines = (_ref = response.notes) != null ? _ref.match(/^.*((\r\n|\n|\r)|$)/gm) : void 0;
      if (noteLines == null) {
        noteLines = [];
      }
      labels = [];
      if (noteLines.length > 0 && string(_.last(noteLines)).startsWith('#')) {
        lastLine = noteLines.pop();
        labels = lastLine.match(/\#([\w-]+)/g);
        labels = _(labels).map(function(s) {
          return string(s).chompLeft('#').toString();
        });
      }
      workout = {
        source: {
          runKeeper: response.activity
        },
        exerciseType: runKeeperWorkoutType(response.type),
        startTime: response['start_time'],
        notes: noteLines.join('\n'),
        avgHR: response['average_heart_rate'],
        labels: labels,
        totalCalories: response['total_calories'],
        totalDistance: response['total_distance'],
        totalDuration: response.duration,
        totalElevation: response.climb
      };
      workout.hrZones = ExerciseZones.computeHrZones({
        user: user,
        totalDuration: workout.totalDuration,
        hrData: response['heart_rate']
      });
      workout.paceZones = ExerciseZones.computePaceZones({
        user: user,
        exerciseType: workout.exerciseType,
        totalDistance: workout.totalDistance,
        distanceData: response.distance
      });
      workout.elevationZones = ExerciseZones.computeElevationZones({
        user: user,
        distanceData: response.distance,
        pathData: response.path
      });
      for (key in workout) {
        if (!__hasProp.call(workout, key)) continue;
        value = workout[key];
        if (value == null) {
          delete workout[key];
        }
      }
      Storage.addWorkout(user.id, workoutId, workout);
      logger.info('Processed workout %s into: %j', workoutId, workout);
      return cb(null, 1);
    });
  };

  loadAllWorkouts = function(userJson, accessToken) {
    var user;
    user = new User(userJson);
    logger.info('Fetching all workouts for user: %s', user.id);
    Storage.setImportCount(user.id, 0);
    return Storage.getAllUserWorkouts(user.id, function(workouts) {
      return runKeeper.get(accessToken, runKeeper.api.userActivities, function(err, response) {
        return Storage.setImportCount(user.id, response.items.length, function(err) {
          var addWorkoutAux, cb;
          logger.info('Existing workouts: %j, RunKeeper error: %j, RunKeeper response: %j', workouts, err, response);
          addWorkoutAux = function(data, cb) {
            var newCb;
            newCb = function(err, results) {
              Storage.markImportItemComplete(user.id);
              return cb(err, results);
            };
            return addWorkout(accessToken, user, workouts, data, newCb);
          };
          cb = function(err, data) {
            var total;
            total = _.reduce(data, (function(x, y) {
              return x + y;
            }), 0);
            Storage.importFinished(user.id, total);
            if (err) {
              return logger.error('Error while importing workouts for: %s -> %j', user.id, err);
            } else {
              return logger.info('Imported %d new exercises for %s', total, user.id);
            }
          };
          return async.mapLimit(response.items, MAX_WORKOUTS_PROCESSED_AT_A_TIME, addWorkoutAux, cb);
        });
      });
    });
  };

  createRunKeeperUser = function(userId, token, done) {
    var createUser, failure, success;
    createUser = function(err, profile) {
      var user;
      if (err) {
        return done(err);
      }
      if (profile == null) {
        return done('Missing user profile');
      }
      user = User.jsonUserFromRunKeeperProfile(profile, userId);
      user.joinedAt = new Date();
      Storage.updateUserProfile(userId, user);
      logger.warn('Created new user profile: %j', user);
      return done(null, user);
    };
    success = function() {
      return runKeeper.get(token, runKeeper.api.profile, createUser);
    };
    failure = function() {
      logger.warn('Unauthorized access: %s', userId);
      return done(null, false, {
        message: 'Unauthorized access.'
      });
    };
    return Storage.canCreateUser(userId, success, failure);
  };

  loadRunKeeperUser = function(userId, done, token) {
    var finishLoading, loadUser, noUser;
    finishLoading = function(err, user, msg) {
      if (user) {
        user.token = Storage.generateFirebaseToken(user.id);
      }
      done(err, user, msg);
      if (user) {
        Storage.logLogin(userId);
        if (token != null) {
          return loadAllWorkouts(user, token);
        }
      }
    };
    loadUser = function(user) {
      logger.warn('user read from DB: %j', user);
      if (user != null) {
        return finishLoading(null, user);
      } else {
        return createRunKeeperUser(userId, token, finishLoading);
      }
    };
    noUser = function() {
      logger.warn('no user read from DB');
      return createRunKeeperUser(userId, token, finishLoading);
    };
    return Storage.getUserProfile(userId, loadUser, noUser);
  };

  module.exports = {
    runKeeperStrategy: function() {
      var callback, config;
      config = {
        clientID: runKeeper.clientId,
        clientSecret: runKeeper.secret,
        callbackURL: runKeeper.callbackURL
      };
      callback = function(token, tokenSecret, profile, done) {
        var userId;
        userId = 'RKU' + profile.id;
        return loadRunKeeperUser(userId, done, token);
      };
      return new RunKeeperStrategy(config, callback);
    },
    isRunKeeperId: isRunKeeperId,
    loadRunKeeperUser: loadRunKeeperUser
  };

}).call(this);
