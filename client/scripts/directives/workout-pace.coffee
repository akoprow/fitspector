'use strict'

class WorkoutPaceDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workout-pace.html'
      scope:
        value: '='
        noIcon: '@'
    }

angular.module('fitspector').directive 'workoutPace', [WorkoutPaceDirective]
