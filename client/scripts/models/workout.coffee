'use strict'

root = exports ? this

class root.Workout
  constructor: (@startTime, @exerciseType) ->

  @fromJson: (json) ->
    # Turn starting date into a moment
    startTime = moment json.startTime
    # Normalize exerciseType id
    exerciseType = json.exerciseType.toLowerCase()

    workout = new Workout startTime, exerciseType
    workout.totalDuration = Time.fromJson json.totalDuration
    workout.totalDistance = Distance.fromJson json.totalDistance

    return workout
