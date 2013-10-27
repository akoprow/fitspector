'use strict'

class WorkoutDistance
  constructor: ->
    return (distance, format) ->
      switch format
        when 'meters'
          distance.asMeters().toFixed(1)
        else
          distance.asKilometers().toFixed(1)

angular.module('fitspector').filter 'workoutDistance', [WorkoutDistance]
