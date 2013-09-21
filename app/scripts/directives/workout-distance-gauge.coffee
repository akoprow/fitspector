'use strict'

class WorkoutDistanceGaugeDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workout-distance-gauge.html'
      scope:
        distance: '='
    }

angular.module('fitspector').directive 'workoutDistanceGauge', [WorkoutDistanceGaugeDirective]
