'use strict'

class WorkoutListDirectiveController
  constructor: ($scope) ->
    # ----- Sorting -----
    $scope.order = '-startedAt'

    $scope.orderBy = (newOrder) ->
      newOrderRev = "-#{newOrder}"
      $scope.order = if $scope.order == newOrderRev then newOrder else newOrderRev


class WorkoutListDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/workout-list.html'
      scope:
        workouts: '='
      controller: ['$scope', WorkoutListDirectiveController]
    }

angular.module('fitspector').directive 'workoutList', [WorkoutListDirective]
