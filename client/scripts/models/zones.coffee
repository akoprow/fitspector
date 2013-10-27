'use strict'

root = exports ? this

class root.Zones
  constructor: (@zones, @Unit) ->

  zonePercent: (i) ->
    zone = @zones[i]
    allZones = @getTotal()
    percent = 100 * @Unit.ratio zone, allZones
    "#{percent}%"

  gaugePercent: (gaugeRange) ->
    ratio = @Unit.ratio @getTotal(), gaugeRange
    ratio = 1 if ratio > 1
    "#{100 * ratio}%"

  getTotal: ->
    @total = _(@zones).reduce @Unit.plus, @Unit.zero unless @total
    @total
