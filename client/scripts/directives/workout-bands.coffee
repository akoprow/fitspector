'use strict'

MARGIN = { left: 30 }

SPACING = { verticalBetweenMonths: 3 }

MONTH_HEIGHT = 30

MONTH_LABEL_HEIGHT = 16

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
          drawBands elt

        recompute = ->
          allWorkouts = WorkoutsProviderService.getAllWorkouts()
          scope.data = recomputeData allWorkouts
          redraw()

        scope.height = TOTAL_HEIGHT
        scope.margin = MARGIN

        # Re-compute and re-draw on data change.
        scope.$on 'workouts.update', recompute
        recompute()

        # Re-draw on screen re-sizing.
        scope.$watch (-> elt.clientWidth), redraw
        scope.$watch (-> elt.clientHeight), redraw
    }


# Compute workouts grouped by months and then by exerciseType with the following structure:
# [{
#    time: 1234551273       // Data for the given month
#    totalTime: 321341      // Total time in seconds for sports in that month
#    sports: [{             // List of sports for which workouts are present in that month
#      exerciseType: 'run'  // Type of the exercise
#      totalTime: 321341    // Time in seconds for all workouts of that sport
#    }]
# }]
recomputeData = (workouts) ->
  _.chain(workouts)
    .groupBy((workout) -> workout.startTime.clone().startOf('month').valueOf())
    .map((workouts, month) ->
      time: Number(month)
      sports: _.chain(workouts)
        .groupBy((workout) -> workout.exerciseType.id)
        .map((workouts, exerciseTypeId) ->
          exerciseType: WorkoutType[exerciseTypeId]
          totalTime: d3.sum workouts, (workout) -> workout.totalDuration.asSeconds()
        )
        .sortBy((data) -> data.exerciseType.id)
        .value()
    )
    .map((monthlyData) -> _.extend monthlyData,
      totalTime: d3.sum monthlyData.sports, (monthlySummary) -> monthlySummary.totalTime
    )
    .value()


yScale =
  d3.scale.linear()
    .domain([0, 1])
    .range([0, MONTH_HEIGHT])


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
    .attr('y', (d, i) -> (MONTH_HEIGHT - MONTH_LABEL_HEIGHT) / 2 + (yScale i))
  container.exit()
    .remove()


drawBands = (elt) ->
  viewport = elt[0]
  container = d3
    .select(viewport)
    .select('g.bands')
    .selectAll('rect')
    .data(d3.range 0, 12)
  container.enter()
    .append('rect')
    .attr('x', 0)
    .attr('y', (d, i) -> yScale i)
    .attr('width', viewport.clientWidth - MARGIN.left)
    .attr('height', MONTH_HEIGHT - SPACING.verticalBetweenMonths)
  container.exit()
    .remove()


angular.module('fitspector').directive 'workoutBands', ['WorkoutsProviderService', WorkoutBands]
