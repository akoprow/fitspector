'use strict'

class WorkoutTimeDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workout-time.html'
      scope:
        time: '='
        noIcon: '@'
    }

angular.module('fitspector').directive 'workoutTime', [WorkoutTimeDirective]
