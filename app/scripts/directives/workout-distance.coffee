'use strict'

class WorkoutDistanceDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workout-distance.html'
      scope:
        distance: '='
    }

angular.module('fitspector').directive 'workoutDistance', [WorkoutDistanceDirective]
