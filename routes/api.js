'use strict';

var async = require('async');
var request = require('request');
var string = require('string');
var winston = require('winston');
var Firebase = require('firebase');

var MAX_WORKOUTS_PROCESSED_AT_A_TIME = 20;


var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: 'fitspector.log' })
  ]
});

/* jshint -W069 */ // We're dealing with RunKeeper names, which are not in camelCase, so we access them with obj['field_name']

var RUNKEEPER_API_URL = 'https://api.runkeeper.com/';

var requestCallback = function(cb) {
  return function(err, res, body) {
    if (!err && res.statusCode === 200) {
      cb(null, body);
    }
  };
};

var runKeeper = {
  api: {
    accessToken: {
      uri: 'https://runkeeper.com/apps/token'
    },
    userInfo: {
      path: 'user',
      accept: 'application/vnd.com.runkeeper.User+json'
    },
    userActivities: {
      path: 'fitnessActivities?pageSize=1000',
      accept: 'application/vnd.com.runkeeper.FitnessActivityFeed+json'
    },
    profile: function(userInfo) {
      return {
        path: userInfo.profile,
        accept: 'application/vnd.com.runkeeper.Profile+json'
      };
    }
  },

  secret: process.env.RUNKEEPER_SECRET,

  get: function(accessToken, config, cb) {
    var opts = {
      url: RUNKEEPER_API_URL + config.path,
      json: {},
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Accept': config.accept
      }
    };
    request.get(opts, requestCallback(cb));
  }
};

var getToken = function(input, callback) {
  logger.debug('getToken | %j', input);
  var params = {
    'grant_type': 'authorization_code',
    code: input.code,
    'client_id': 'b459a206aced43729fc79026df108e60',
    'client_secret': runKeeper.secret,
    'redirect_uri': 'http://localhost:8080/login_rk'
  };
  var postOptions = {
    uri: runKeeper.api.accessToken.uri,
    form: params
  };
  var cb = requestCallback(function(err, body) {
    var accessToken = JSON.parse(body)['access_token'];
    callback(null, {accessToken: accessToken});
  });
  request.post(postOptions, cb);
};

var getUser = function(input, callback) {
  logger.debug('getUser | %j', input);
  var cb = function(err, body) {
    callback(null, {accessToken: input.accessToken, userData: body});
  };
  runKeeper.get(input.accessToken, runKeeper.api.userInfo, cb);
};

var getProfile = function(input, callback) {
  logger.debug('getProfile | %j', input);
  var cb = function(err, body) {
    callback(null, {
      accessToken: input.accessToken,
      userData: input.userData,
      profileData: body
    });
  };
  runKeeper.get(input.accessToken, runKeeper.api.profile(input.userData), cb);
};

var mkUser = function(input, callback) {
  logger.debug('mkUser | %j', input);
  var userId = 'RK' + input.userData.userID;
  var user = {
    name: input.profileData.name,
    isMale: input.profileData.gender === 'M',
    birthday: new Date(input.profileData.birthday),
    smallImgUrl: input.profileData['medium_picture']
  };
  var usersRef = new Firebase('https://fitspector.firebaseIO.com/users');
  usersRef.child(userId).set(user);

  callback(null, {userId: userId, accessToken: input.accessToken});
};

var runKeeperWorkoutType = function(type) {
  switch (type) {
  case 'Running':
    return 'run';
  default:
    return '???';
  }
};

var addWorkout = function(data, cb) {
  var prefix = '/fitnessActivities/';
  if (!string(data.uri).startsWith(prefix)) {
    cb('Cannot get activity ID from its URI: ' + data.uri);
    return;
  }

  var workoutId = string(data.uri).chompLeft(prefix).toString();
  var workout = {
    type: runKeeperWorkoutType(data.type),
    startTime: data['start_time'],
    totalDistance: data['total_distance'],
    totalDuration: data.duration
  };
  logger.info('Processed workout [', workoutId, ']: ', workout);
  cb();
};

var loadAllWorkouts = function(userId, accessToken) {
  logger.info('Fetching all workouts for user: ', userId, ' with token: ', accessToken);
  runKeeper.get(accessToken, runKeeper.api.userActivities, function(err, response) {
    async.eachLimit(response.items, MAX_WORKOUTS_PROCESSED_AT_A_TIME, addWorkout, function(err) {
      if (err) {
        logger.error('Error while importing workouts for: ', userId, ' -> ', err);
      }
    });
  });
};

exports.loginRK = function(req, res) {
  logger.log('info', 'RunKeeper login request with code: ' + req.params.code);
  var login = async.compose(mkUser, getProfile, getUser, getToken);
  login({code: req.params.code}, function(err, data) {
    var response = {userId: data.userId};
    logger.info('Response: ', response);
    res.send(response);
    loadAllWorkouts(data.userId, data.accessToken);
  });
};
