'use strict'

root = exports ? this

class root.Zones
  constructor: (@zones, @Unit) ->

  @fromJson: (json, Unit) ->
    zones = _(json).map Unit.fromJson
    new Zones(zones, Unit)

  zonePercent: (i) ->
    zone = @zones[i]
    allZones = @getTotal()
    100 * @Unit.ratio zone, allZones

  getTotal: ->
    @total = _(@zones).reduce @Unit.plus, @Unit.zero unless @total
    @total
