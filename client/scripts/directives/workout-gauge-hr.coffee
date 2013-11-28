'use strict'

class WorkoutGaugeHrDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workout-gauge-hr.html'
      scope:
        zones: '='
        maxGaugeTime: '='
    }

angular.module('fitspector').directive 'workoutGaugeHr', [WorkoutGaugeHrDirective]
