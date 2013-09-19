'use strict'

root = exports ? this

class root.Workout
  constructor: (@startedAt, @exerciseType) ->

  @fromJson: (json) ->
    # Turn starting date into a moment
    startedAt = moment json.startedAt
    # Normalize exerciseType id
    exerciseType = json.exerciseType.toLowerCase()

    workout = new Workout startedAt, exerciseType

    workout.note = json.note
    # Time by HR zones
    workout.time = Zones.fromJson json.time, Time
    workout.totalTime = workout.time.getTotal()

    # Distance by pace zones
    workout.distance = Zones.fromJson json.pace, Distance
    workout.totalDistance = workout.distance.getTotal()

    return workout
