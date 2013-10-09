'use strict'

path = require 'path'

filePath = path.join __dirname, '../client'

exports.index = (req, res) ->
  res.sendfile (path.join filePath, 'index.html')

exports.partials = (req, res) ->
  name = req.params.name
  res.sendfile (path.join filePath, 'views', name + '.html')
