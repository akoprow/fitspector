'use strict'

class WorkoutElevation
  constructor: ->
    return (distance) ->
      (distance.asKilometers() * 1000).toFixed(0)

angular.module('fitspector').filter 'workoutElevation', [WorkoutElevation]
