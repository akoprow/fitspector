'use strict';

var async = require('async');
var request = require('request');

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
  console.log('getToken | %j', input);
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
  console.log('getUser | %j', input);
  var cb = function(err, body) {
    callback(null, {accessToken: input.accessToken, userData: body});
  };
  runKeeper.get(input.accessToken, runKeeper.api.userInfo, cb);
};

var getProfile = function(input, callback) {
  console.log('getProfile | %j', input);
  var cb = function(err, body) {
    callback(null, {userData: input.userData, profileData: body});
  };
  runKeeper.get(input.accessToken, runKeeper.api.profile(input.userData), cb);
};

var mkUser = function(input, callback) {
  console.log('mkUser | %j', input);
  var user = {
    userID: 'RK' + input.userData.userID,
    name: input.profileData.name,
    isMale: input.profileData.gender === 'M',
    birthday: new Date(input.profileData.birthday),
    smallImg: input.profileData['medium_picture']
  };
  callback(null, user);
};

exports.loginRK = function(req, res) {
  console.log('RunKeeper login request');
  var login = async.compose(mkUser, getProfile, getUser, getToken);
  login({code: req.params.code}, function(err, user) {
    console.log('Login successful: %j', user);
    res.send(user);
  });
};
