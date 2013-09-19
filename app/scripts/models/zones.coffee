'use strict'

root = exports ? this

class root.Zones
  constructor: (@zones, @Unit) ->

  @fromJson: (json, Unit) ->
    zones = _(json).map Unit.fromJson
    new Zones(zones, Unit)

  total: ->
    _(zones).reduce @zones Unit.zero
