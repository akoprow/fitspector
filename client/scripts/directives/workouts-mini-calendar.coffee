'use strict'

WIDTH_TOTAL = 1000
WIDTH_MARGIN = 50

HEIGHT_MARGIN_TOP = 20
HEIGHT_MARGIN_YEAR = 3
HEIGHT_YEAR = 20


class WorkoutsMiniCalendarDirective
  constructor: (WorkoutsProviderService) ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workouts-mini-calendar.html'
      scope:
        workouts: '='
      link: (scope, elt) ->
        scope.getWidth = -> WIDTH_TOTAL

        scope.getHeight = ->
          workoutsRange = WorkoutsProviderService.getWorkoutsTimeRange()
          numYears = workoutsRange.end.year() - workoutsRange.beg.year() + 1

          yearHeight = HEIGHT_MARGIN_YEAR + (WIDTH_TOTAL - WIDTH_MARGIN) / 365
          return HEIGHT_MARGIN_TOP + numYears * yearHeight

        scope.$watchCollection WorkoutsProviderService.getAllWorkouts, ->
    }


angular.module('fitspector').directive 'workoutsMiniCalendar', ['WorkoutsProviderService', WorkoutsMiniCalendarDirective]
