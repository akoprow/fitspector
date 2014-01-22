'use strict'

# Total width of the whole component.
WIDTH_TOTAL = 1100
# Left margin for year labels.
WIDTH_MARGIN = 50
# Horizontal spacing between charts for consecutive years.
WIDTH_SPACING_BETWEEN_YEARS = 3

# Top margin for month labels.
HEIGHT_MARGIN_TOP = 20
# Height of one year row.
HEIGHT_PER_YEAR = 25
# Vertical spacing between charts for consecutive years.
HEIGHT_SPACING_BETWEEN_YEAR = 3
# Height of one line of year/month labels.
HEIGHT_TEXT_LABEL = 16


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

        # TODO(koper) Use debounce or something to avoid update called once per
        # every single workout update (at startup)
        update = (workouts) ->
          workoutsRange = WorkoutsProviderService.getWorkoutsTimeRange()
          workoutsRange.beg.startOf 'year'
          workoutsRange.end = moment().startOf 'year'

          updateYearLabels elt, workoutsRange
          updateMainChart elt, workouts, workoutsRange

        updateChart = _.debounce update, 500
        scope.$watchCollection WorkoutsProviderService.getAllWorkouts, updateChart
    }


updateYearLabels = (elt, workoutsRange) ->
  container = d3
    .select(elt[0])
    .selectAll('text.year-label')
    .data(d3.time.years(workoutsRange.beg, workoutsRange.end), (d) -> moment(d).year())
  container.enter()
    .append('text')
    .attr('x', 0)
    .attr('y', 0)
    .text(d3.time.format('%Y'))
    .classed('year-label', true)
  container
    .attr('y', (d, i) -> HEIGHT_MARGIN_TOP + (HEIGHT_PER_YEAR - HEIGHT_TEXT_LABEL) / 2 + HEIGHT_PER_YEAR * i)
  container.exit()
    .remove()


updateMainChart = (elt, workouts, workoutsRange) ->
  width_per_year = (WIDTH_TOTAL - WIDTH_MARGIN - 11 * WIDTH_SPACING_BETWEEN_YEARS) / 12

  # Mapping from months to their position on the X axis
  pos_x = d3.scale.linear()
    .domain([0, 11])
    .range([WIDTH_MARGIN, WIDTH_TOTAL - width_per_year])

  # Mapping from years to their position on the Y axis
  pos_y = d3.scale.linear()
    .domain([workoutsRange.beg.year(), workoutsRange.beg.year() + 1])
    .range([HEIGHT_MARGIN_TOP, HEIGHT_MARGIN_TOP + HEIGHT_PER_YEAR])

  # Compute workouts grouped by months.
  workoutsByMonth = _.chain(workouts)
    .groupBy((workout) -> workout.startTime.clone().startOf('month').valueOf())
    .map((workouts, month) -> { month: Number(month), workouts: workouts })
    .value()

  container = d3
    .select(elt[0])
    .selectAll('rect.monthly-efforts')
    .data(workoutsByMonth, (d) -> d.month)
  container.enter()
    .append('rect')
    .classed('monthly-efforts', true)
  container
    .attr('x', (d) -> pos_x moment(d.month).month())
    .attr('y', (d) -> pos_y moment(d.month).year())
    .attr('width', width_per_year)
    .attr('height', HEIGHT_PER_YEAR - HEIGHT_SPACING_BETWEEN_YEAR)
  container.exit()
    .remove()

angular.module('fitspector').directive 'workoutsMiniCalendar', ['WorkoutsProviderService', WorkoutsMiniCalendarDirective]
