var path = require('path');

//get correct directory path
var filePath = __dirname.replace('routes', 'app/')

exports.index = function(req, res) {
  res.sendfile(path.join(filePath, 'index.html'));
};

exports.partials = function (req, res) {
  var name = req.params.name;
  res.sendfile(path.join(filePath, 'views', name + '.html'));
};
