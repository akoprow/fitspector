'use strict'

class WorkoutDistance
  constructor: ->
    return (distance) ->
      distance.asKilometers().toFixed(1)

angular.module('fitspector').filter 'workoutDistance', [WorkoutDistance]
