// TODO(koper) Do we need both request & restify? The problem is that /token requires application/x-www-form-urlencoded requests (now handled by request), while all other calls operate on JSON (restify used).
var request = require('request');
var restify = require('restify');
var assert = require('assert');

var API_URL = 'https://api.runkeeper.com/';

var api = {
  access_token: {
    uri: 'https://runkeeper.com/apps/token'
  },
  user_info: {
    path: 'user',
    accept: 'application/vnd.com.runkeeper.User+json'
  }
};

var secret = process.env.RUNKEEPER_SECRET;

var runKeeper = {
  get: function(access_token, config, callback) {
    var client = restify.createJsonClient({
      url: API_URL,
      accept: config.accept,
      headers: {
        'Authorization': 'Bearer ' + access_token
      }
    });
    client.get(config.path, callback);
  }
};

var getUser = function(access_token, err, success) {
  runKeeper.get(access_token, api.user_info, function(err, req, res, obj) {
    assert.ifError(err);
    console.log('getUser response: %j', obj);
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
    client_secret: secret,
    redirect_uri: 'http://localhost:8080/login_rk'
  };

  var r = request.post({
    uri: api.access_token.uri,
    form: params
  }, function(err, res, body) {
    if (res.statusCode == 200) {
      try {
        var access_token = JSON.parse(body).access_token;
        console.log('Access token: ' + access_token);
        var user = getUser(access_token);
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
