'use strict'

class WorkoutsCtrl
  constructor: (DataService, $scope) ->
    $scope.allWorkouts = -> DataService.getAllWorkouts()

    $scope.order = '-startedAt'

    $scope.timeRange = 'year'
    $scope.setTimeRange = (newRange) ->
      $scope.timeRange = newRange

    $scope.orderBy = (newOrder) ->
      $scope.order = if $scope.order == newOrder then "-#{newOrder}" else newOrder

angular.module('fitspector').controller 'WorkoutsCtrl', ['DataService', '$scope', WorkoutsCtrl]
