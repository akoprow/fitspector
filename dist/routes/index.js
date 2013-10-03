(function() {
  'use strict';
  var filePath, path;

  path = require('path');

  filePath = __dirname.replace('routes', 'app/');

  exports.index = function(req, res) {
    return res.sendfile(path.join(filePath, 'index.html'));
  };

  exports.partials = function(req, res) {
    var name;
    name = req.params.name;
    return res.sendfile(path.join(filePath, 'views', name + '.html'));
  };

}).call(this);
