'use strict';

/* jshint -W069 */ // We're dealing with RunKeeper names, which are not in camelCase, so we access them with obj['field_name']

// TODO(koper) Do we need both request & restify? The problem is that /token requires application/x-www-form-urlencoded requests (now handled by request), while all other calls operate on JSON (restify used).
var request = require('request');

var RUNKEEPER_API_URL = 'https://api.runkeeper.com/';

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

  get: function(accessToken, config, callback) {
    var opts = {
      url: RUNKEEPER_API_URL + config.path,
      json: {},
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Accept': config.accept
      }
    };
    request.get(opts, callback);
  }
};

var getUser = function(accessToken, callback) {
  runKeeper.get(accessToken, runKeeper.api.userInfo, callback);
};

var getProfile = function(accessToken, userData, callback) {
  runKeeper.get(accessToken, runKeeper.api.profile(userData), callback);
};

var mkUser = function(userData, profileData) {
  return {
    userID: 'RK' + userData.userID,
    isMale: profileData.gender === 'M',
    birthday: new Date(profileData.birthday),
    smallImg: profileData['medium_picture']
  };
};

exports.loginRK = function(req, res) {
  var errorResponse = function() {
    // TODO(koper) ...
  };
  console.log('RunKeeper login request');

  var params = {
    'grant_type': 'authorization_code',
    code: req.params.code,
    'client_id': 'b459a206aced43729fc79026df108e60',
    'client_secret': runKeeper.secret,
    'redirect_uri': 'http://localhost:8080/login_rk'
  };

  request.post({
    uri: runKeeper.api.accessToken.uri,
    form: params
  }, function(err, res1, body) {
    if (res1.statusCode === 200) {
      try {
        var accessToken = JSON.parse(body)['access_token'];
        getUser(accessToken, function(err, _, userData) {
          getProfile(accessToken, userData, function(err, _, profileData) {
            var userData = mkUser(userData, profileData);
            console.log('Login successful: %j', userData);
            res.send(userData);
          });
        });
      }
      catch (err) {
        errorResponse();
      }
    } else {
      errorResponse();
    }
  });
};
