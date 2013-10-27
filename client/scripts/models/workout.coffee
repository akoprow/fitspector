'use strict'

root = exports ? this

class root.Workout
  constructor: (@startTime, @exerciseType) ->

  source: ->
    switch
      when @id.substring(0, 3) == 'RKW' then 'RunKeeper'

  @fromJson: (json, id) ->
    # Turn starting date into a moment
    startTime = moment json.startTime
    # Normalize exerciseType id
    exerciseType = json.exerciseType.toLowerCase()

    workout = new Workout startTime, exerciseType
    workout.id = id
    workout.detailsUri = json.detailsUri
    workout.notes = json.notes
    workout.totalDuration = Time.fromJson json.totalDuration
    workout.totalDistance = Distance.fromJson json.totalDistance
    if not workout.totalDistance.isZero()
      workout.pace = new Pace
        time: workout.totalDuration,
        distance: workout.totalDistance

    return workout
