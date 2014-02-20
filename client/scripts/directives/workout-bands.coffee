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
          drawBands elt, scope.data, 2013

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
# { workouts: [{
#     time: 1234551273       // Data for the given month
#     totalTime: 321341      // Total time in seconds for sports in that month
#     sports: [{             // List of sports for which workouts are present in that month
#       exerciseType: 'run'  // Type of the exercise
#       totalTime: 321341    // Time in seconds for all workouts of that sport
#     }]
#   }]
#   max: 321341              // Max time across all months
# }
recomputeData = (workouts) ->
  workoutsData =
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
  return {
    workouts: workoutsData
    max: d3.max workoutsData, (d) -> d.totalTime
  }


yScale = d3.scale.linear()
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


drawBands = (elt, data, year) ->
  # Filter workouts summaries to the selected year
  workouts = _.chain(data.workouts)
    .filter((d) -> moment(d.time).year() == year)
    .map((d) ->
      y = 0
      d.sports = _.map(d.sports, (s) -> _.extend s, { y0: y, y1: y += s.totalTime })
      return d
    )
    .value()

  viewport = elt[0]
  xScale = d3.scale.linear()
    .domain([0, data.max])
    .range([0, viewport.clientWidth - MARGIN.left])

  showRow = (rd) ->
    d3.select(this)
      .selectAll('rect.col')
      .data((d) -> d.sports)
      .enter()
        .append('rect')
        .classed('col', true)
        .attr('x', (d) -> xScale d.y0)
        .attr('y', (d) -> yScale (moment(rd.time).month()))
        .attr('width', (d) -> xScale (d.y1 - d.y0))
        .attr('height', MONTH_HEIGHT - SPACING.verticalBetweenMonths)
        .attr('fill', (d) -> d.exerciseType.color)

  rows = d3
    .select(viewport)
    .select('g.bands')
    .selectAll('g.row')
      .data(workouts)
    .enter()
      .append('g')
      .classed('row', true)
      .each(showRow)


angular.module('fitspector').directive 'workoutBands', ['WorkoutsProviderService', WorkoutBands]
