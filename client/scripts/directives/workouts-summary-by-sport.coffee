'use strict'

ELEMENT_WIDTH = 60


class WorkoutsSummaryBySportDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workouts-summary-by-sport.html'
      scope:
        workouts: '='
        queryFilter: '='
        sportFilterListener: '&'
      link: (scope, elt) ->
#        scope.allSummaryTypes = [
#          id: 'total'
#          name: 'Total'
#        ,
#          id: 'avg'
#          name: 'Weekly avg.'
#        ]
#        scope.summaryType = scope.allSummaryTypes[0].id

        scope.elementWidth = ELEMENT_WIDTH

        scope.$watchCollection 'workouts', -> recompute scope

        scope.$watch 'queryFilter', -> recompute scope

        scope.sportFilter = 'all'
        scope.setSportFilter = (sport) ->
          scope.sportFilter = if scope.sportFilter == sport.id then 'all' else sport.id
          scope.sportFilterListener {sport: scope.sportFilter}
        scope.$watch 'sportFilter', -> recompute scope

        scope.activeColumn = -1
        scope.setActiveColumn = (index) ->
          scope.activeColumn = index

        recompute scope
    }


recompute = (scope) ->
  sports = scope.sports = {}
  if not scope.workouts?
    return

  # TODO(koper) Re-write using _.groupBy and d3.sum
  processWorkout = (workout) ->
    sportData = sports[workout.exerciseType] || {}
    update = (oldValue, zero, f) -> f (oldValue || zero)

    sports[workout.exerciseType.id] =
      exerciseType: workout.exerciseType
      sessions: update sportData.sessions, 0, (s) -> s + 1
      totalDistance: update sportData.totalDistance, Distance.zero, (d) -> Distance.plus d, workout.totalDistance
      totalDuration: update sportData.totalDuration, Time.zero, (t) -> Time.plus t, workout.totalDuration
      totalElevation: update sportData.totalElevation, Distance.zero, (d) -> Distance.plus d, workout.totalElevation

  sportFilter = scope.sportFilter
  workouts = scope.$eval 'workouts | filter: queryFilter'

  _.chain(workouts)
    .filter((workout) -> sportFilter == 'all' || workout.exerciseType == sportFilter)
    .each(processWorkout)


angular.module('fitspector').directive 'workoutsSummaryBySport', [WorkoutsSummaryBySportDirective]


class WorkoutSportsSummaryAnimation
  getPosition = (element) ->
    index = element.scope().$index;
    return {
      left: index * ELEMENT_WIDTH
    }

  constructor: ->
    return {
      enter: (element, done) ->
        jQuery(element).attr(getPosition element)
        done()

      move: (element, done) ->
        jQuery(element).animate(getPosition element, done)
    }


#angular.module('fitspector').animation '.sport-summary-value', [WorkoutSportsSummaryAnimation]
