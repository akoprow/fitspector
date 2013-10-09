'use strict'

class WorkoutTime
  constructor: ->
    return (time) ->
      h = time.hours()
      m = time.minutes()
      p = if m < 10 then '0' else ''
      "#{h}:#{p}#{m}"

angular.module('fitspector').filter 'workoutTime', [WorkoutTime]
