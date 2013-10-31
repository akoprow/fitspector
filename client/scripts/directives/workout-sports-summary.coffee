'use strict'

class WorkoutSportsSummaryDirective
  constructor: ($filter) ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workout-sports-summary.html'
      scope:
        workouts: '='
      link: (scope, elt) ->
        scope.allSummaryTypes = [
          id: 'total'
          name: 'Total'
        ,
          id: 'avg'
          name: 'Weekly avg.'
        ]

        scope.summaryType = scope.allSummaryTypes[0].id
        scope.sportFilter = 'all'

        # TODO(koper) Store those arguments on the object to avoid passing them explicity.
        recompute $filter, elt, scope
        scope.$watch 'workouts', (_) -> recompute $filter, elt, scope
        scope.$watch 'sportFilter', (_) -> recompute $filter, elt, scope
    }

recompute = ($filter, elt, scope) ->
  sports = scope.sports = {}
  if not scope.workouts?
    return

  processWorkout = (workout) ->
    sportData = sports[workout.exerciseType] || {}
    update = (oldValue, zero, f) -> f (oldValue || zero)

    sports[workout.exerciseType] =
      sessions: update sportData.sessions, 0, (s) -> s + 1
      totalDistance: update sportData.totalDistance, Distance.zero, (d) -> Distance.plus d, workout.totalDistance
      totalDuration: update sportData.totalDuration, Time.zero, (t) -> Time.plus t, workout.totalDuration
      totalElevation: update sportData.totalElevation, Distance.zero, (d) -> Distance.plus d, workout.totalElevation

  _(scope.workouts).each processWorkout
  redraw $filter, elt, scope

redraw = ($filter, elt, scope) ->
  metrics = ['icon', 'sessions', 'time', 'distance', 'elevation']
  _(metrics).each (metric) -> redrawMetric $filter, elt, scope, metric

redrawMetric = ($filter, elt, scope, metric) ->
  # select
  data = _(scope.sports).map (val, key) -> _.extend val, { id: key }
  entries = d3
# TODO(koper) The selection below should be made relative to 'elt'
#    .select(elt)
    .select(".sport-summary .#{metric} .data")
    .selectAll('.entry')
    .data(data)

  # enter
  enter = entries
    .enter()
    .append(if metric == 'icon' then 'img' else 'span')
    .attr('class', (s) -> "sport-#{s.id}")
    .classed('entry', true)
#    .classed('hasData', hasData)
#    .style('left', leftPosition)
#    .style('opacity', 0);

  # exit
  entries
    .exit()
    .transition()
    .style('opacity', 0)
    .remove();

  # update
  update = entries
    .transition()
#    .style('left', leftPosition)
    .style('opacity', metric == 'icon' ? 0.8 : 1.0)

  # update.style 'background-color', sportBackgroundColor if metric == 'icon'

  dataUpdate = update #.filter(hasData);
  showTotal = scope.summaryType == 'total'
  dataUpdate.text(
    if showTotal
      switch metric
        when 'icon' then ''
        when 'sessions' then (s) -> s.sessions
        when 'time' then (s) -> $filter('workoutTime')(s.totalTime)
        when 'distance' then (s) -> $filter('workoutDistance')(s.totalDistance)
        when 'elevation' then (s) -> $filter('workoutElevation')(s.totalElevation)
        else throw new Error 'Unsupported operation'
    else
      throw new Error 'Unsupported operation'
  )

angular.module('fitspector').directive 'workoutSportsSummary', ['$filter', WorkoutSportsSummaryDirective]
