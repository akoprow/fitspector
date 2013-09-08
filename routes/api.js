// TODO(koper) Do we need both request & restify? The problem is that /token requires application/x-www-form-urlencoded requests (now handled by request), while all other calls operate on JSON (restify used).
var request = require('request');

var RUNKEEPER_API_URL = 'https://api.runkeeper.com/';

var runKeeper = {
  api: {
    access_token: {
      uri: 'https://runkeeper.com/apps/token'
    },
    user_info: {
      path: 'user',
      accept: 'application/vnd.com.runkeeper.User+json'
    },
    profile: function(user_info) {
      return {
        path: user_info.profile,
        accept: 'application/vnd.com.runkeeper.Profile+json'
      };
    }
  },

  secret: process.env.RUNKEEPER_SECRET,

  get: function(access_token, config, callback) {
    var opts = {
      url: RUNKEEPER_API_URL + config.path,
      json: {},
      headers: {
        'Authorization': 'Bearer ' + access_token,
        'Accept': config.accept
      }
    };
    request.get(opts, callback);
  }
};

var getUser = function(access_token, callback) {
  runKeeper.get(access_token, runKeeper.api.user_info, callback);
};

var getProfile = function(access_token, userData, callback) {
  runKeeper.get(access_token, runKeeper.api.profile(userData), callback);
};

var mkUser = function(user_data, profile_data) {
  return {
    userID: 'RK' + user_data.userID,
    isMale: profile_data.gender == 'M',
    birthday: new Date(profile_data.birthday),
    smallImg: profile_data.medium_picture
  };
};

exports.loginRK = function(req, res) {
  var errorResponse = function() {
    // TODO(koper) ...
  };
  console.log('RunKeeper login request');

  var params = {
    grant_type: "authorization_code",
    code: req.params.code,
    client_id: 'b459a206aced43729fc79026df108e60',
    client_secret: runKeeper.secret,
    redirect_uri: 'http://localhost:8080/login_rk'
  };

  request.post({
    uri: runKeeper.api.access_token.uri,
    form: params
  }, function(err, res1, body) {
    if (res1.statusCode == 200) {
      try {
        var access_token = JSON.parse(body).access_token;
        getUser(access_token, function(err, _, user_data) {
          getProfile(access_token, user_data, function(err, _, profile_data) {
            var userData = mkUser(user_data, profile_data);
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
