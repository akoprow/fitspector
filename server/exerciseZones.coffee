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

computeHrZones = (args) ->
  singleZone =
    if args.totalDuration?
      Zones.mkUnknownZone Time, new Time {seconds: args.totalDuration}
    else
      undefined

  if not args.hrData?.length then return singleZone.serialize()

  zoneBoundaries = args.user.getHrZoneBoundaries()
  if not zoneBoundaries? then return singleZone.serialize()
  hrZoneClassifier = numericalZoneClassifier zoneBoundaries

  hrSeries = []
  timeSeries = []

  processHrEntry = (time, entry) ->
    timeSeries.push(new Time {seconds: entry.timestamp - time})
    hrSeries.push entry['heart_rate']
    return entry.timestamp
  _.reduce args.hrData, processHrEntry, 0

  zones = new Zones(Time)
  for hr, i in hrSeries
    zones.addToZone (hrZoneClassifier hr), timeSeries[i]

  return zones.serialize()

####################################################################################################

computeRunningPaceZones = (user, distanceData) ->
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

  paceZoneBoundaries = user.getRunningPaceZoneBoundaries()
  if not paceZoneBoundaries? then return null
  paceZoneClassifier = numericalZoneClassifier paceZoneBoundaries

  # Apply smoothing (rolling average over 5 samples) to the speed measurements.
  speedSeries = filters.average speedSeries, 5

  zones = new Zones(Distance)
  for speed, i in speedSeries
    zones.addToZone (paceZoneClassifier speed), distanceSeries[i]

  return zones


computePaceZones = (args) ->
  zones =
    if args.distanceData?.length and args.exerciseType == 'run'
      computeRunningPaceZones args.user, args.distanceData
    else
      null

  if zones
    zones.serialize()
  else if args.totalDistance
    Zones.mkUnknownZone(Distance, new Distance {meters: args.totalDistance}).serialize()
  else
    undefined

####################################################################################################

computeElevationZones = (args) ->
  if not args.distanceData?.length || not args.pathData?.length then return undefined

  distanceSeries = []
  elevationSeries = []

  processElevationEntry = (acc, entry) ->
    elevationSeries.push (entry.altitude - acc)
    return entry.altitude
  _.reduce args.pathData, processElevationEntry, args.pathData[0].altitude

  processDistanceEntry = (acc, entry) ->
    distanceSeries.push (entry.distance - acc)
    return entry.distance
  _.reduce args.distanceData, processDistanceEntry, 0

  if distanceSeries.length != elevationSeries.length
    logger.warn "Lengths of distance/elevation series do not match (distance: #{distanceSeries.length}, elevation: #{elevationSeries.length}"
    return undefined

  elevationZoneClassifier = numericalZoneClassifier args.user.getElevationZoneBoundaries()
  zones = new Zones(Distance)

  for distance, i in distanceSeries
    elevationChange = elevationSeries[i]
    grade = 100 * elevationChange / distance
    zones.addToZone (elevationZoneClassifier grade), new Distance {meters: distance}

  return zones.serialize()

####################################################################################################

module.exports =
  computeHrZones: computeHrZones
  computePaceZones: computePaceZones
  computeElevationZones: computeElevationZones
