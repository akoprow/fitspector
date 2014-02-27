'use strict'

class SportIconDirective
  constructor: (WorkoutsProviderService) ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/sport-icon.html'
      scope:
        exerciseTypeId: '@'
      link: (scope) ->
        scope.$watch 'exerciseTypeId', (exerciseTypeId) ->
          if exerciseTypeId?
            scope.exerciseType = WorkoutType[exerciseTypeId]
    }

angular.module('fitspector').directive 'sportIcon', ['WorkoutsProviderService', SportIconDirective]
