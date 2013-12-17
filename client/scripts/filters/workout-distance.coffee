'use strict'

class WorkoutDistance
  constructor: ->
    return (distance, format) ->
      return '' if not distance?
      value =
        switch format
          when 'meters'
            distance.asMeters()
          else
            distance.asKilometers()
      if value >= 10
        value.toFixed 0
      else
        value.toFixed 1


angular.module('fitspector').filter 'workoutDistance', [WorkoutDistance]
