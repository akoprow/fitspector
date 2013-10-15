'use strict'

path = require 'path'
logger = require './utils/logger'

filePath = path.join __dirname, '../client'

####################################################################################################

exports.index = (req, res) ->
  logger.warn 'index request'
  user = req.user || { guest: true }
  # TODO(koper) Figure out a better way to do that; we *DO* want to cache index.html
  # We do not want to cache that file, because of the logged-in user info transmitted via cookies
  res.setHeader 'Cache-Control', 'no-cache, no-store, max-age=0'
  logger.warn 'user cookie: %s', JSON.stringify user
  res.cookie 'user', JSON.stringify user
  res.sendfile (path.join filePath, 'index.html')

####################################################################################################

exports.partials = (req, res) ->
  name = req.params.name
  res.sendfile (path.join filePath, 'views', name)
