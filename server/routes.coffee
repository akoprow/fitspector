'use strict'

path = require 'path'
logger = require './utils/logger'

filePath = path.join __dirname, '../client'

####################################################################################################

exports.index = (req, res) ->
  user = req.user || { guest: true }
  res.cookie 'user', JSON.stringify user
  logger.debug 'index request; user cookie: %s', JSON.stringify user
  res.sendfile (path.join filePath, 'index.html')

####################################################################################################

exports.partials = (req, res) ->
  name = req.params.name
  res.sendfile (path.join filePath, 'views', name)
