'use strict'


class WorkoutsMiniCalendarDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workouts-mini-calendar.html'
      scope:
        workouts: '='
      link: (scope, elt) ->
    }


angular.module('fitspector').directive 'workoutsMiniCalendar', [WorkoutsMiniCalendarDirective]
