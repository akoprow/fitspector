'use strict'

class WorkoutTimeGaugeDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workout-time-gauge.html'
      scope:
        time: '='
    }

angular.module('fitspector').directive 'workoutTimeGauge', [WorkoutTimeGaugeDirective]
