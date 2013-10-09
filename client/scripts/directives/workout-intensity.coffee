'use strict'

class WorkoutIntensityDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workout-intensity.html'
      scope:
        value: '='
        noIcon: '@'
    }

angular.module('fitspector').directive 'workoutIntensity', [WorkoutIntensityDirective]
