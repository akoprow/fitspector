'use strict'

path = require 'path'
logger = require './utils/logger'

filePath = path.join __dirname, '../client'

####################################################################################################

exports.index = (req, res) ->
  logger.warn 'index request'
  logger.warn 'user cookie: %s', JSON.stringify req.user
  res.cookie 'user', JSON.stringify req.user
  res.sendfile (path.join filePath, 'index.html')

####################################################################################################

exports.partials = (req, res) ->
  name = req.params.name
  res.sendfile (path.join filePath, 'views', name + '.html')
