'use strict'

class WorkoutGaugeDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workout-gauge.html'
      scope:
        gaugeMax: '='
        type: '@'
        zones: '='
    }

angular.module('fitspector').directive 'workoutGauge', [WorkoutGaugeDirective]
