'use strict'

WIDTH_TOTAL = 1000
WIDTH_MARGIN = 50

HEIGHT_MARGIN_TOP = 20
HEIGHT_PER_YEAR = 30


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
          return HEIGHT_MARGIN_TOP + numYears * HEIGHT_PER_YEAR

        update = ->
          updateYearLabels WorkoutsProviderService, elt

        scope.$watchCollection WorkoutsProviderService.getAllWorkouts, update
    }


updateYearLabels = (workoutsProvider, elt) ->
  workoutsRange = workoutsProvider.getWorkoutsTimeRange()
  container = d3
    .select(elt[0])
    .selectAll('text')
    .data(d3.time.years(workoutsRange.beg.startOf('year'), moment()), (d) -> moment(d).year())
  container.enter()
    .append('text')
    .attr('x', 0)
    .attr('y', 0)
    .text(d3.time.format('%Y'))
  container
    .attr('y', (d, i) -> HEIGHT_MARGIN_TOP + HEIGHT_PER_YEAR * i)
  container.exit()
    .remove()


angular.module('fitspector').directive 'workoutsMiniCalendar', ['WorkoutsProviderService', WorkoutsMiniCalendarDirective]
