'use strict'

MARGIN = { bottom: 30, left: 30, right: 10 }

SPACING = { verticalBetweenMonths: 3 }

MONTH_HEIGHT = 30

MONTH_LABEL_HEIGHT = 11

TOTAL_HEIGHT = MARGIN.bottom + SPACING.verticalBetweenMonths + MONTH_HEIGHT * 12


class WorkoutBands
  constructor: (WorkoutsProviderService) ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workout-bands.html'
      scope:
        year: '@'
        valueMode: '='
      link: (scope, elt) ->
        redraw = ->
          drawMonthLabels elt
          drawBands elt, scope.data, 2013
          drawGrid elt, scope.data

        recompute = ->
          allWorkouts = WorkoutsProviderService.getAllWorkouts()
          scope.data = recomputeData allWorkouts
          redraw()

        scope.height = TOTAL_HEIGHT
        scope.margin = MARGIN

        # Re-compute and re-draw on data change.
        scope.$on 'workouts.update', -> scope.$apply recompute
        recompute()

        # Re-draw on screen re-sizing.
        scope.$watch (-> elt.clientWidth), redraw
        scope.$watch (-> elt.clientHeight), redraw

        # Re-draw on change of options.
        scope.$watch scope.valueMode, redraw
    }


# Compute workouts grouped by months and then by exerciseType with the following structure:
#
# { workouts: [{
#     time: 1234551273        // Data for the given month
#     totalDuration: 3.3      // Total duration (in hours) for sports in that month
#     totalDistance: 10.1     // Total distance (in kilometers) for sports in that month
#     totalElevation: 300     // Total elevation (in meters) for sports in that month
#     sports: [{              // List of sports for which workouts are present in that month
#       exerciseType: 'run'   // Type of the exercise
#       totalDuration: 3.3    // Total duration (in hours) for all workouts of that sport
#       totalDistance: 10.1   // Total distance (in kilometers) for all workouts of that sport
#       totalElevation: 300   // Total elevation (in meters) for all workouts of that sport.
#     }]
#   }]
#   maxDuration: 3.3          // Max monthly duration (across all sports).
#   maxDistance: 10.1         // Max monthly distance (across all sports).
#   maxElevation: 300         // Max monthly elevation (across all sports).
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
            totalDuration: d3.sum workouts, (workout) -> workout.totalDuration.asHours()
            totalDistance: d3.sum workouts, (workout) -> workout.totalDistance.asKilometers()
            totalElevation: d3.sum workouts, (workout) -> workout.totalElevation.asMeters()
          )
          .sortBy((data) -> data.exerciseType.id)
          .value()
      )
      .map((monthlyData) -> _.extend monthlyData,
        totalDuration: d3.sum monthlyData.sports, (monthlySummary) -> monthlySummary.totalDuration
        totalDistance: d3.sum monthlyData.sports, (monthlySummary) -> monthlySummary.totalDistance
        totalElevation: d3.sum monthlyData.sports, (monthlySummary) -> monthlySummary.totalElevation
      )
      .value()

  allSports =
    _.chain(workoutsData)
      .map((w) -> _.map(w.sports, (s) -> s.exerciseType))
      .flatten()
      .uniq((e) -> e.id)
      .value()

  return {
    workouts: workoutsData
    allSports: allSports
    maxDuration: d3.max workoutsData, (d) -> d.totalDuration
    maxDistance: d3.max workoutsData, (d) -> d.totalDistance
    maxElevation: d3.max workoutsData, (d) -> d.totalElevation
  }


yScale = d3.scale.linear()
  .domain([0, 1])
  .range([0, MONTH_HEIGHT])


drawMonthLabels = (elt) ->
  container = d3
    .select(elt[0])
    .select('g.time-axis')
    .selectAll('text')
    .data(d3.range 0, 12)
  container.enter()
    .append('svg:text')
    .attr('x', 0)
    .attr('y', 0)
    .text((d) -> moment().month(d).format('MMM'))
  container
    .attr('y', (d, i) -> SPACING.verticalBetweenMonths + (MONTH_HEIGHT - MONTH_LABEL_HEIGHT) / 2 + (yScale i))
  container.exit()
    .remove()


drawBands = (elt, data, year) ->
  # Filter workouts summaries to the selected year
  workouts = _.chain(data.workouts)
    .filter((d) -> moment(d.time).year() == year)
    .map((d) ->
      y = 0
      d.sports = _.map(d.sports, (s) -> _.extend s, { y0: y, y1: y += s.totalDuration })
      return d
    )
    .value()

  viewport = elt[0]
  xScale = d3.scale.linear()
    .domain([0, data.maxDuration])
    .range([0, viewport.clientWidth - MARGIN.left - MARGIN.right])

  showRow = (rd) ->
    row = d3.select(this)
      .selectAll('rect.col')
      .data((d) -> d.sports)
    row.enter()
      .append('svg:rect')
      .attr('class', 'col')
      .attr('x', 0)
      .attr('y', (d) -> SPACING.verticalBetweenMonths + yScale (moment(rd.time).month()))
      .attr('width', 0)
      .attr('height', MONTH_HEIGHT - SPACING.verticalBetweenMonths)
      .attr('fill', (d) -> d.exerciseType.color)
      .attr('stroke', (d) -> d3.rgb(d.exerciseType.color).darker())

    row.transition()
      .attr('width', (d) -> xScale (d.y1 - d.y0))
      .attr('x', (d) -> xScale d.y0)

  rows = d3
    .select(viewport)
    .select('g.bands')
    .selectAll('g.row')
      .data(workouts)
    .enter()
      .append('svg:g')
      .attr('class', 'row')
      .each(showRow)


drawGrid = (elt, data) ->
  viewport = elt[0]
  xScale = d3.scale.linear()
    .domain([0, data.maxDuration])
    .range([0, viewport.clientWidth - MARGIN.left - MARGIN.right])

  # Group
  rule = d3.select(elt[0])
    .select('.value-axis')
    .selectAll('g.rule')
    .data(xScale.ticks(10))
    .enter()
      .append('svg:g')
        .attr('class', 'rule')
        .attr('transform', (d) -> "translate(#{xScale(d)}, 0)")

  # Line
  rule.append("svg:line")
    .attr('y2', TOTAL_HEIGHT - MARGIN.bottom)
    .style("stroke", (d) -> if d then '#f5f5f5' else '#000')
    .style("stroke-opacity", (d) -> if d then .7 else null)

  # Label
  rule.append('svg:text')
    .attr('dy', '.35em')
    .attr('y', TOTAL_HEIGHT - MARGIN.bottom)
    .text((d) -> d3.format(",d")(d) + 'h')


angular.module('fitspector').directive 'workoutBands', ['WorkoutsProviderService', WorkoutBands]
