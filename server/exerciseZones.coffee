###################################################################################################
# Utility functions to compute HR/pace/elevation zones for workouts.
#
# Author: Adam Koprowski
####################################################################################################
'use strict'

logger = require './utils/logger'
moment = require 'moment'
_ = require 'underscore'

Distance = require('../client/scripts/models/distance').Distance
Time = require('../client/scripts/models/time').Time
Zones = require('../client/scripts/models/zones').Zones

####################################################################################################

# TODO(koper) Those constants should be made into user-specific settings.
# Maximal heart rate (unit: bpm)
maxHR = 187

# Functional Threshold Pace (FTP) (unit: km/h)
# http://www.joefrielsblog.com/2010/05/quick-guide-to-training-with-heart-rate-power-and-pace.html
runningFunctionalThresholdPace = 14.6

# TODO(koper) Should this be configurable?
# Based on the Zoladz method: http://en.wikipedia.org/wiki/Heart_rate
# Boundaries expressed in the difference from HRmax.
hrZoneBoundaries = [45, 35, 25, 15]

# Based on Friel's zones:
#   http://www.joefrielsblog.com/2010/05/quick-guide-to-training-with-heart-rate-power-and-pace.html
#
# Zone 1 Slower than 129% of FTPa
# Zone 2 114% to 129% of FTPa
# Zone 3 106% to 113% of FTPa
# Zone 4 99% to 105% of FTPa
# Zone 5a 97% to 100% of FTPa
# Zone 5b 90% to 96% of FTPa
# Zone 5c Faster than 90% of FTPa
#
# ZONE           maximal    hard     medium     low      minimal   no_effort
# FTPa min/km     <100%   99%-105%  106%-113%  114%-129% 130%-145%   <145%
# FTPa km/h       >100%   95%-101%   88%-94%    78%-88%   69%-77%
# FTPa fitnett:   >100%      95%       88%        78%      69%
#
# Boundaries expressed in % of FTP.
runningPaceZoneBoundaries = [69, 78, 88, 95]

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
    zone = classifier data, acc
    {value, acc} = metric data, acc
    zones.addToZone zone, value
    return acc

  _.reduce(rawData, process, zero)
  return zones

####################################################################################################

numericalZoneClassifier = (boundaries, toNumber) ->
  (value, acc) ->
    num = toNumber value, acc
    switch
      when num > boundaries[3] then Zones.MAXIMUM_ZONE
      when num > boundaries[2] then Zones.HARD_ZONE
      when num > boundaries[1] then Zones.MODERATE_ZONE
      when num > boundaries[0] then Zones.LIGHT_ZONE
      else Zones.VERY_LIGHT_ZONE

####################################################################################################

computeHrZones = (hrData) ->
  timeMetric = (data, acc) ->
    return {
      value: new Time {seconds: data.timestamp - acc}
      acc: data.timestamp
    }

  hrZoneClassifier = ->
    boundaries = _.map hrZoneBoundaries, (adjuster) -> maxHR - adjuster
    numericalZoneClassifier boundaries, (data) -> data['heart_rate']

  zones = computeZones Time, hrData, 0, timeMetric, hrZoneClassifier()
  return zones.serialize()

####################################################################################################

computeRunningPaceZones = (distanceData) ->
  distanceMetric = (data, acc) ->
    return {
      value: new Distance {meters: data.distance - acc.distance}
      acc: data
    }

  paceZoneClassifier = ->
    boundaries = _.map runningPaceZoneBoundaries, (multiplier) -> runningFunctionalThresholdPace * multiplier / 100
    computeSpeed = (data, acc) ->
      timeDelta = (data.timestamp - acc.timestamp) / Time.SECONDS_IN_AN_HOUR
      distanceDelta = (data.distance - acc.distance) / Distance.METERS_IN_KILOMETER
      distanceDelta / timeDelta
    numericalZoneClassifier boundaries, computeSpeed

  zones = computeZones Distance, distanceData, {timestamp: 0, distance: 0}, distanceMetric, paceZoneClassifier()
  return zones.serialize()

####################################################################################################

module.exports =
  computeHrZones: computeHrZones
  computeRunningPaceZones: computeRunningPaceZones
