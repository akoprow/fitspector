'use strict';

path = require 'path'

# get correct directory path
filePath = __dirname.replace 'routes', 'app/'

exports.index = (req, res) ->
  res.sendfile (path.join filePath, 'index.html')

exports.partials = (req, res) ->
  name = req.params.name
  res.sendfile (path.join filePath, 'views', name + '.html')
