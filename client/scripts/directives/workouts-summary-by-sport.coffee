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
  if not scope.workouts?
    return

  sportFilter = scope.sportFilter
  workouts = scope.$eval 'workouts | filter: queryFilter'

  scope.sports = _.chain(workouts)
    .filter((workout) -> sportFilter == 'all' || workout.exerciseType == sportFilter)
    .groupBy((workout) -> workout.exerciseType.id)
    .map((workouts) ->
      exerciseType: workouts[0].exerciseType
      sessions: workouts.length
      totalDistance: new Distance { meters: d3.sum workouts, (workout) -> workout.totalDistance.asMeters() }
      totalDuration: new Time { seconds: d3.sum workouts, (workout) -> workout.totalDuration.asSeconds() }
      totalElevation: new Distance { meters: d3.sum workouts, (workout) -> workout.totalElevation.asMeters() }
    )
    .values()
    .value()


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
