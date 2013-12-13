###################################################################################################
# Utility functions to compute HR/pace/elevation zones for workouts.
#
# Author: Adam Koprowski
####################################################################################################
'use strict'

moment = require 'moment'
_ = require 'underscore'

Time = require('../client/scripts/models/time').Time
Zones = require('../client/scripts/models/zones').Zones

####################################################################################################

# TODO(koper) Those constants should be made into user-specific settings.
maxHR = 187

hrZoneBoundaries = [0.5, 0.6, 0.7, 0.8, 0.9]

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
  zones = new Zones([], Unit)
  # TODO(koper) Implement...
  zones

####################################################################################################

numericalZoneClassifier = (boundaries) ->
  (value) ->
    # TODO(koper) Implement...
    0

####################################################################################################

computeHrZones = (hrData) ->
  timeMetric = (hrDataPoint, acc) ->
    return {
      value: new Time {seconds: hrDataPoint.timestamp - acc}
      acc: hrDataPoint.timestamp
    }

  hrZoneClassifier = ->
    boundaries = _.map hrZoneBoundaries, (percent) -> maxHR * percent
    numericalZoneClassifier boundaries

  zones = computeZones Time, hrData, 0, timeMetric, hrZoneClassifier()
  return zones.serialize()

####################################################################################################

module.exports =
  computeHrZones: computeHrZones
