'use strict'

class WorkoutGaugeDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workout-gauge.html'
      scope:
        gaugeMax: '='
        noMultiplier: '@'
        type: '@'
        zones: '='
    }

angular.module('fitspector').directive 'workoutGauge', [WorkoutGaugeDirective]
