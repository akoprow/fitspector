'use strict'

class WorkoutSportsSummaryDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workout-sports-summary.html'
      scope:
        workouts: '='
      link: (scope) ->
        scope.allSummaryTypes = [
          id: 'total'
          name: 'Total'
        ,
          id: 'avg'
          name: 'Weekly avg.'
        ]

        scope.summaryType = scope.allSummaryTypes[0].id
        scope.sportFilter = 'all'
    }

angular.module('fitspector').directive 'workoutSportsSummary', [WorkoutSportsSummaryDirective]
