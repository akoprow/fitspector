###################################################################################################
# Utility functions to compute HR/pace/elevation zones for workouts.
#
# Author: Adam Koprowski
####################################################################################################
'use strict'

logger = require './utils/logger'
moment = require 'moment'
_ = require 'underscore'

Time = require('../client/scripts/models/time').Time
Zones = require('../client/scripts/models/zones').Zones

####################################################################################################

# TODO(koper) Those constants should be made into user-specific settings.
maxHR = 187

# TODO(koper) Should this be configurable?
# Based on the Zoladz method: http://en.wikipedia.org/wiki/Heart_rate
hrZoneBoundaries = [45, 35, 25, 15]

####################################################################################################

# Classifies data into zones.
#
# @param Unit A class representing zone units.
# @param {Array.<D>} rawData Array of measurements
# @param {T} zero Starting element for folding over raw data.
# @param {function(D, T) : {value: Unit, acc: D} metric
#     A function that given a raw data element and an accumulator returns an object containing new
#     value of the accumulator as well as the value associated with that measurements.
# @param {function(D) : number} classifier
#     A function that given a raw data element gives the index of the zone it corresponds to.
# @return Zones object representing give data classified into zones.
computeZones = (Unit, rawData, zero, metric, classifier) ->
  zones = new Zones(Unit)

  process = (acc, data) ->
    {value, acc} = metric data, acc
    zones.addToZone (classifier data), value
    return acc

  _.reduce(rawData, process, zero)
  return zones

####################################################################################################

numericalZoneClassifier = (boundaries, toNumber) ->
  (value) ->
    num = toNumber value
    switch
      when num > boundaries[3] then Zones.MAXIMUM_ZONE
      when num > boundaries[2] then Zones.HARD_ZONE
      when num > boundaries[1] then Zones.MODERATE_ZONE
      when num > boundaries[0] then Zones.LIGHT_ZONE
      else Zones.VERY_LIGHT_ZONE

####################################################################################################

computeHrZones = (hrData) ->
  timeMetric = (hrDataPoint, acc) ->
    return {
      value: new Time {seconds: hrDataPoint.timestamp - acc}
      acc: hrDataPoint.timestamp
    }

  hrZoneClassifier = ->
    boundaries = _.map hrZoneBoundaries, (adjuster) -> maxHR - adjuster
    numericalZoneClassifier boundaries, (data) -> data['heart_rate']

  zones = computeZones Time, hrData, 0, timeMetric, hrZoneClassifier()
  return zones.serialize()

####################################################################################################

module.exports =
  computeHrZones: computeHrZones
