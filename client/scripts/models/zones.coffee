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

  # TODO(koper) This should eventually go away and be replaced by real zones.
  @splitIntoRandomZones: (max, Unit) ->
    split = _.range(6).map -> Math.random()
    plus = (memo, num) -> memo + num
    total = split.reduce plus, 0
    zones = _.map split, (v) -> Unit.fraction max, (v / total)
    return new Zones(zones, Unit)
