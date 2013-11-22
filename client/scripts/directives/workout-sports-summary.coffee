'use strict'

class WorkoutSportsSummaryDirective
  constructor: ->
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

        recompute scope
        scope.$watch 'workouts', (_) -> recompute scope
        scope.$watch 'sportFilter', (_) -> recompute scope
    }


recompute = (scope) ->
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


angular.module('fitspector').directive 'workoutSportsSummary', [WorkoutSportsSummaryDirective]
