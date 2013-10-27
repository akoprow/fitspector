'use strict'

class WorkoutTime
  constructor: ->
    # If short display: mm:ss, otherwise hh:mm
    return (time, format) ->
      [h, l] = switch format
        when 'short'
          [time.minutes(), time.seconds()]
        else
          [time.hours(), time.minutes()]
      p = if l < 10 then '0' else ''
      "#{h}:#{p}#{l}"

angular.module('fitspector').filter 'workoutTime', [WorkoutTime]
