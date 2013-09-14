'use strict'

class WorkoutTimeDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workout-time.html'
      scope:
        time: '='
    }

angular.module('fitspector').directive 'workoutTime', [WorkoutTimeDirective]
