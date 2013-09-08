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
    console.log('get params: %j', opts);
    request.get(opts, callback);
  }
};

var getUser = function(access_token) {
  runKeeper.get(access_token, runKeeper.api.user_info, function(err, res, body) {
    console.log('getUser: status code: ' + res.statusCode);
    console.log('Body: %j', body);
  });
};

exports.loginRK = function(req, res) {
  var errorResponse = function() {
    // TODO(koper) ...
  };

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
  }, function(err, res, body) {
    if (res.statusCode == 200) {
      try {
        var access_token = JSON.parse(body).access_token;
        console.log('Access token: ' + access_token);
        getUser(access_token);
        // TODO(koper) ...
      }
      catch (err) {
        errorResponse();
      }
    } else {
      errorResponse();
    }
  });
};
