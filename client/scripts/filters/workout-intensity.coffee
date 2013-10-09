'use strict'

class WorkoutIntensity
  constructor: ->
    return (intensity) ->
      intensity.value().toFixed(0)

angular.module('fitspector').filter 'workoutIntensity', [WorkoutIntensity]
