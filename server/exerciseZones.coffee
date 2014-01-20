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
User = require('../client/scripts/models/user').User
Zones = require('../client/scripts/models/zones').Zones

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

  hrZoneClassifier = numericalZoneClassifier User.getHrZoneBoundaries()

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

  paceZoneClassifier = numericalZoneClassifier User.getRunningPaceZoneBoundaries

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

  elevationZoneClassifier = numericalZoneClassifier User.getElevationZoneBoundaries()
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
