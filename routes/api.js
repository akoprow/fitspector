var request = require('request');

var api = {
  access_token: {
    uri: 'https://runkeeper.com/apps/token'
  }
};

var secret = process.env.RUNKEEPER_SECRET;

exports.loginRK = function(req, res) {
  console.log('code: ', req.params.code);
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
    console.log('Params: %j', params);

    console.log('Response code: ' + res.statusCode);
    console.log('Body: %j', body);
  });
};
