'use strict'

MONTH_HEIGHT = 20
TOTAL_HEIGHT = MONTH_HEIGHT * 12

class WorkoutBands
  constructor: (WorkoutsProviderService) ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workout-bands.html'
      scope:
        year: '@'
      link: (scope, elt) ->
        redraw = ->
          drawMonthLabels elt

        scope.height = TOTAL_HEIGHT

        redraw()
        scope.$on 'workouts.update', redraw
    }

drawMonthLabels = (elt) ->
  container = d3
    .select(elt[0])
    .select('g.month-labels')
    .selectAll('text')
    .data(d3.range 0, 12)
  container.enter()
    .append('text')
    .attr('x', 0)
    .attr('y', 0)
    .text((d) -> moment().month(d).format('MMM'))
  container
    .attr('y', (d, i) -> i * MONTH_HEIGHT)
  container.exit()
    .remove()

angular.module('fitspector').directive 'workoutBands', ['WorkoutsProviderService', WorkoutBands]
