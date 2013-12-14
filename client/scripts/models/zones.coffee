'use strict'

root = exports ? this

class root.Zones
  constructor: (@zones, @Unit) ->

  zonePercent: (i) ->
    return "0%" if not @zones[i]
    zone = @zones[i]
    allZones = @getTotal()
    percent = 100 * @Unit.ratio zone, allZones
    "#{percent}%"

  gaugePercent: (gaugeRange) ->
    ratio = @Unit.ratio @getTotal(), gaugeRange
    ratio = 1 if ratio > 1
    "#{100 * ratio}%"

  gaugeMultiplicator: (gaugeRange) ->
    ratio = @Unit.ratio @getTotal(), gaugeRange
    if ratio >= 1.1
      ratio.toFixed 1
    else
      null

  getTotal: ->
    @total = _(@zones).reduce @Unit.plus, @Unit.zero unless @total
    @total

  addToZone: (i, value) ->
    @zones[i] = @Unit.plus @zones[i], value

  # Returns a version of the object that is appropriate for serialization.
  serialize: ->
    @zones

  # TODO(koper) This should eventually go away and be replaced by real zones.
  @splitIntoRandomZones: (max, Unit) ->
    split = _.range(6).map -> Math.random()
    plus = (memo, num) -> memo + num
    total = split.reduce plus, 0
    zones = _.map split, (v) -> Unit.fraction max, (v / total)
    return new Zones(zones, Unit)

  # Based on Polar sport zones for running:
  # http://www.polar.com/us-en/training_with_polar/training_articles/maximize_performance/running/polar_sport_zones_for_running
  @UNKNOWN_ZONE: 0
  @VERY_LIGHT_ZONE: 1
  @LIGHT_ZONE: 2
  @MODERATE_ZONE: 3
  @HARD_ZONE: 4
  @MAXIMUM_ZONE: 5