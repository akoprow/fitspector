'use strict'

path = require 'path'
logger = require './utils/logger'

filePath = path.join __dirname, '../client'

####################################################################################################

exports.index = (req, res) ->
  logger.warn 'index request'
  user = req.user || { guest: true }
  logger.warn 'user: %j', user
  res.cookie 'user', JSON.stringify user
  res.sendfile (path.join filePath, 'index.html')

####################################################################################################

exports.partials = (req, res) ->
  name = req.params.name
  res.sendfile (path.join filePath, 'views', name + '.html')
