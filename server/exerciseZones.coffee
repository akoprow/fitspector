###################################################################################################
# Utility functions to compute HR/pace/elevation zones for workouts.
#
# Author: Adam Koprowski
####################################################################################################
'use strict'

filters = require 'filters'
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
# TODO(koper) This s fragile as it needs to be synchronized with values in client/scripts/controllers/my-performance.coffee
# 
# Based on the Zoladz method: http://en.wikipedia.org/wiki/Heart_rate
# Boundaries expressed in the difference from HRmax.
hrZoneBoundaries = [45, 35, 25, 15]

# Based on Friel's zones:
#   http://www.joefrielsblog.com/2010/05/quick-guide-to-training-with-heart-rate-power-and-pace.html
#
# Zone 1 Slower than 129% of FTPa
# Zone 2 114% to 129% of FTPa
# Zone 3 106% to 113% of FTPa
# Zone 4 101% to 105% of FTPa
# Zone 5a 97% to 100% of FTPa
# Zone 5b 90% to 96% of FTPa
# Zone 5c Faster than 90% of FTPa
#
# 
# ZONE           maximum    hard     moderate    light   very light
# FTPa min/km     <100%   101-105%   106-113%   114-129%   >129%
# FTPa km/h       >100%      95%       88%        78%
#
# Boundaries expressed in % of FTP.
runningPaceZoneBoundaries = [78, 88, 95, 100]

elevationZoneBoundaries = [-9, -3, 3, 9]

####################################################################################################

numericalZoneClassifier = (boundaries) ->
  (num) ->
    switch
      when num > boundaries[3] then Zones.MAXIMUM_ZONE
      when num > boundaries[2] then Zones.HARD_ZONE
      when num > boundaries[1] then Zones.MODERATE_ZONE
      when num > boundaries[0] then Zones.LIGHT_ZONE
      else Zones.VERY_LIGHT_ZONE

####################################################################################################

computeHrZones = (hrData) ->
  hrSeries = []
  timeSeries = []

  processHrEntry = (time, entry) ->
    timeSeries.push(new Time {seconds: entry.timestamp - time})
    hrSeries.push entry['heart_rate']
    return entry.timestamp
  _.reduce hrData, processHrEntry, 0

  zoneBoundaries = _.map hrZoneBoundaries, (adjuster) -> maxHR - adjuster
  hrZoneClassifier = numericalZoneClassifier zoneBoundaries

  zones = new Zones(Time)
  for hr, i in hrSeries
    zones.addToZone (hrZoneClassifier hr), timeSeries[i]

  return zones.serialize()

####################################################################################################

computeRunningPaceZones = (distanceData) ->
  speedSeries = []
  distanceSeries = []

  processDistanceEntry = (acc, entry) ->
    timeDelta = (entry.timestamp - acc.timestamp) / Time.SECONDS_IN_AN_HOUR
    distanceDelta = (entry.distance - acc.distance) / Distance.METERS_IN_KILOMETER
    speed = distanceDelta / timeDelta
    speedSeries.push speed
    distanceSeries.push(new Distance {km: distanceDelta})
    return entry
  _.reduce distanceData, processDistanceEntry, {timestamp: 0, distance: 0}

  zoneBoundaries = _.map runningPaceZoneBoundaries, (multiplier) -> runningFunctionalThresholdPace * multiplier / 100
  paceZoneClassifier = numericalZoneClassifier zoneBoundaries

  # Apply smoothing (rolling average over 5 samples) to the speed measurements.
  speedSeries = filters.average speedSeries, 5

  zones = new Zones(Distance)
  for speed, i in speedSeries
    zones.addToZone (paceZoneClassifier speed), distanceSeries[i]

  return zones.serialize()

####################################################################################################

computeElevationZones = (distanceData, elevationData) ->
  distanceSeries = []
  elevationSeries = []

  processElevationEntry = (acc, entry) ->
    elevationSeries.push (entry.altitude - acc)
    return entry.altitude
  _.reduce elevationData, processElevationEntry, elevationData[0].altitude

  processDistanceEntry = (acc, entry) ->
    distanceSeries.push (entry.distance - acc)
    return entry.distance
  _.reduce distanceData, processDistanceEntry, 0

  if distanceSeries.length != elevationSeries.length
    logger.warn "Lengths of distance/elevation series do not match (distance: #{distanceSeries.length}, elevation: #{elevationSeries.length}"
    return null

  elevationZoneClassifier = numericalZoneClassifier elevationZoneBoundaries
  zones = new Zones(Distance)

  for distance, i in distanceSeries
    elevationChange = elevationSeries[i]
    grade = 100 * elevationChange / distance
    zones.addToZone (elevationZoneClassifier grade), new Distance {meters: distance}

  return zones.serialize()

####################################################################################################

module.exports =
  computeHrZones: computeHrZones
  computeRunningPaceZones: computeRunningPaceZones
  computeElevationZones: computeElevationZones
