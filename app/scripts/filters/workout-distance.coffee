'use strict'

class WorkoutDistance
  constructor: ->
    return (distance) ->
      distance.kilometers().toFixed(1)

angular.module('fitspector').filter 'workoutDistance', [WorkoutDistance]
