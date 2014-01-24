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

        update = (workouts) ->
          workoutsRange = WorkoutsProviderService.getWorkoutsTimeRange()
          workoutsRange.beg.startOf 'year'
          workoutsRange.end = moment().startOf 'year'

          updateYearLabels elt, workoutsRange
          updateMonthlyLabels elt
          updateMainChart elt, workouts, workoutsRange

        scope.$watchCollection WorkoutsProviderService.getAllWorkouts, update
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
  # Compute workouts grouped by months and then by exerciseType with the following structure:
  # [{
  #    time: 1234551273       // Data for the given month
  #    totalTime: 321341      // Total time in seconds for sports in that month
  #    sports: [{             // List of sports for which workouts are present in that month
  #      exerciseType: 'run'  // Type of the exercise
  #      totalTime: 321341    // Time in seconds for all workouts of that sport
  #    }]
  # }]
  workoutsByMonth = _.chain(workouts)
    .groupBy((workout) -> workout.startTime.clone().startOf('month').valueOf())
    .map((workouts, month) ->
      time: Number(month)
      sports: _.chain(workouts)
        .groupBy((workout) -> workout.exerciseType)
        .map((workouts, exerciseType) ->
          exerciseType: exerciseType
          totalTime: d3.sum workouts, (workout) -> workout.totalDuration.asSeconds()
        ).value()
    )
    .map((monthlyData) -> _.extend monthlyData,
      totalTime: d3.sum monthlyData.sports, (monthlySummary) -> monthlySummary.totalTime
    ).value()

  # Random coloring of exercises.
  exerciseColor = d3.scale.category20()
    .domain(_.map workouts, (workout) -> workout.exerciseType)

  # Prepare the container.
  container = d3
    .select(elt[0])
    .select('g.monthly-efforts')
    .attr('transform', "translate(#{MARGIN.left}, #{MARGIN.top})")
    .selectAll('g.month')
    .data(workoutsByMonth, (d) -> d.time)

  # Mapping from months to their position on the X axis.
  pos_x = d3.scale.linear()
    .domain([0, 12])
    .range([0, WIDTH])

  # Mapping from years to their position on the Y axis.
  pos_y = d3.scale.linear()
    .domain([workoutsRange.beg.year(), workoutsRange.beg.year() + 1])
    .range([0, HEIGHT_PER_YEAR])

  # Mapping from workout times to their width on the screen.
  widthPerYear = WIDTH / 12 - SPACING.years
  size_x = d3.scale.linear()
    .domain([0, d3.max workoutsByMonth, (m) -> m.totalTime])
    .range([0, widthPerYear])

  container.enter()
    .append('g')
    .classed('month', true)
  container
    .attr('transform', (d) ->
      px = pos_x(moment(d.time).month()) + (widthPerYear - size_x d.totalTime) / 2
      py = pos_y moment(d.time).year()
      "translate(#{px}, #{py})"
    )
    .each(drawMonthlyChart size_x, exerciseColor)
  container.exit()
    .remove()


drawMonthlyChart = (size_x, exerciseColor) -> (data) ->
  d3.select(this)
    .selectAll('rect')
    .data(data.sports, (d) -> d.exerciseType)
  .enter()
    .append('rect')
    .attr('width', (d) -> size_x d.totalTime)
    .attr('height', HEIGHT_PER_YEAR - SPACING.years)
    .attr('fill', (d) -> exerciseColor d.exerciseType)


angular.module('fitspector').directive 'workoutsMiniCalendar', ['WorkoutsProviderService', WorkoutsMiniCalendarDirective]
