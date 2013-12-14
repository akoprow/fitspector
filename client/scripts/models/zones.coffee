'use strict'

# TODO(koper) Find a more fool-proof way to share code between the server and the browser.
_ = if window? then window._ else require 'underscore'

root = exports ? this

class root.Zones
  constructor: (@Unit) ->
    @zones = []

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
    if i >= 0 && i <= 5
      oldValue = @zones[i] ? @Unit.zero
      @zones[i] = @Unit.plus oldValue, value

  # TODO(koper) Capture more consistently this pattern of serialization/deserialization.
  # Returns a version of the object that is appropriate for serialization.
  serialize: ->
    return _.map @zones, (v) -> v.serialize()

  @deserialize: (Unit, json) ->
    zones = new Zones(Unit)
    _(@ALL_ZONES).each (zone) -> zones.addToZone zone, Unit.deserialize json[zone]
    return zones

  # TODO(koper) This should eventually go away and be replaced by real zones.
  setRandomZones: (max) ->
    split = _(@ALL_ZONES).map -> Math.random()
    plus = (memo, num) -> memo + num
    total = split.reduce plus, 0
    @zones = _.map split, (v) -> @Unit.fraction max, (v / total)

  # Based on Polar sport zones for running:
  # http://www.polar.com/us-en/training_with_polar/training_articles/maximize_performance/running/polar_sport_zones_for_running
  @UNKNOWN_ZONE = 0
  @VERY_LIGHT_ZONE = 1
  @LIGHT_ZONE = 2
  @MODERATE_ZONE = 3
  @HARD_ZONE = 4
  @MAXIMUM_ZONE = 5

  @ALL_ZONES = [ @UNKNOWN_ZONE, @VERY_LIGHT_ZONE, @LIGHT_ZONE, @MODERATE_ZONE, @HARD_ZONE, @MAXIMUM_ZONE ]
