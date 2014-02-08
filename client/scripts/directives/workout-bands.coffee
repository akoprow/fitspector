'use strict'

MARGIN = { left: 30 }

MONTH_HEIGHT = 30

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

        recompute = ->
          allWorkouts = WorkoutsProviderService.getAllWorkouts()
          scope.data = recomputeData allWorkouts
          redraw()

        scope.height = TOTAL_HEIGHT
        scope.margin = MARGIN

        recompute()
        scope.$on 'workouts.update', recompute
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
