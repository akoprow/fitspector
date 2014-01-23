'use strict'

# Total width of the whole component.
WIDTH_TOTAL = 1100

# Height of one year row.
HEIGHT_PER_YEAR = 25

# Height of one line of year/month labels.
HEIGHT_TEXT_LABEL = 16

# Left margin for year labels and top margin for month labels.
MARGIN = { top: 28, left: 45 }

# Horizontal and vertical spacing between charts for consecutive years.
SPACING = { years: 3 }

WIDTH = WIDTH_TOTAL - MARGIN.left


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
          return MARGIN.top + numYears * HEIGHT_PER_YEAR

        # TODO(koper) Use debounce or something to avoid update called once per
        # every single workout update (at startup)
        update = (workouts) ->
          workoutsRange = WorkoutsProviderService.getWorkoutsTimeRange()
          workoutsRange.beg.startOf 'year'
          workoutsRange.end = moment().startOf 'year'

          updateYearLabels elt, workoutsRange
          updateMonthlyLabels elt
          updateMainChart elt, workouts, workoutsRange

        updateChart = _.debounce update, 500
        scope.$watchCollection WorkoutsProviderService.getAllWorkouts, updateChart
    }


updateYearLabels = (elt, workoutsRange) ->
  container = d3
    .select(elt[0])
    .select('g.year-labels')
    .selectAll('text')
    .data(d3.time.years(workoutsRange.beg, workoutsRange.end), (d) -> moment(d).year())
  container.enter()
    .append('text')
    .attr('x', 0)
    .attr('y', 0)
    .text(d3.time.format('%Y'))
  container
    .attr('y', (d, i) -> MARGIN.top + (HEIGHT_PER_YEAR - HEIGHT_TEXT_LABEL) / 2 + HEIGHT_PER_YEAR * i)
  container.exit()
    .remove()


updateMonthlyLabels = (elt) ->
  pos_x = d3.scale.linear()
    .domain([-0.5, 11.5])
    .range([0, WIDTH])
  d3.select(elt[0])
    .select('g.month-labels')
    .attr('transform', "translate(#{MARGIN.left}, #{(MARGIN.top + HEIGHT_TEXT_LABEL) / 2})")
    .selectAll('text')
    .data(d3.range(0, 12))
  .enter()
    .append('text')
    .attr('x', pos_x)
    .attr('y', 0)
    .text((d) -> moment().month(d).format('MMMM'))


updateMainChart = (elt, workouts, workoutsRange) ->
  # Compute workouts grouped by months.
  workoutsByMonth = _.chain(workouts)
    .groupBy((workout) -> workout.startTime.clone().startOf('month').valueOf())
    .map((workouts, month) -> { time: Number(month), workouts: workouts })
    .map((month) -> _.extend month, { total: d3.sum month.workouts, (workout) -> workout.totalDuration.asSeconds() })
    .value()

  # Prepare the container.
  container = d3
    .select(elt[0])
    .select('g.monthly-efforts')
    .attr('transform', "translate(#{MARGIN.left}, #{MARGIN.top})")
    .selectAll('g.month')
    .data(workoutsByMonth) #XXX, (d) -> d.time)

  # Mapping from months to their position on the X axis.
  pos_x = d3.scale.linear()
    .domain([0, 12])
    .range([0, WIDTH])
  # Mapping from years to their position on the Y axis.
  pos_y = d3.scale.linear()
    .domain([workoutsRange.beg.year(), workoutsRange.beg.year() + 1])
    .range([0, HEIGHT_PER_YEAR])
  # Mapping from workout times to their width on the screen.
  size_x = d3.scale.linear()
    .domain([0, d3.max workoutsByMonth, (m) -> m.total])
    .range([0, WIDTH / 12 - SPACING.years])

#  container.enter()
#    .append('g')
#    .classed('month', true)
#  container
#    .attr('transform', (d) -> "translate(#{pos_x moment(d.time).month()}, #{pos_y moment(d.time).year()})")
  container.enter()
    .append('rect')
  container
    .attr('x', (d) -> pos_x moment(d.time).month())
    .attr('y', (d) -> pos_y moment(d.time).year())
    .attr('width', (d) -> size_x d.total)
    .attr('height', HEIGHT_PER_YEAR - SPACING.years)
  container.exit()
    .remove()

angular.module('fitspector').directive 'workoutsMiniCalendar', ['WorkoutsProviderService', WorkoutsMiniCalendarDirective]
