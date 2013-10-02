'use strict'

class WorkoutElevationDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workout-elevation.html'
      scope:
        value: '='
        noIcon: '@'
    }

angular.module('fitspector').directive 'workoutElevation', [WorkoutElevationDirective]
