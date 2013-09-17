'use strict'

class WorkoutsCtrl
  constructor: (DataService, $scope) ->
    $scope.allWorkouts = -> DataService.getAllWorkouts()

    $scope.order = '-startedAt'

    # TODO(koper) Extract this into a time-selection service/controller?
    $scope.timeStart = moment()

    $scope.setTimeRange = (newRange) ->
      $scope.timeRange = newRange
      switch newRange
        when 'year' then $scope.timeRangeDesc = $scope.timeStart.format('YYYY')
        when 'month' then $scope.timeRangeDesc = $scope.timeStart.format('MMM YYYY')
        when 'week' then $scope.timeRangeDesc = $scope.timeStart.format('W / YYYY')

    $scope.setTimeRange 'year'

    $scope.orderBy = (newOrder) ->
      $scope.order = if $scope.order == newOrder then "-#{newOrder}" else newOrder

angular.module('fitspector').controller 'WorkoutsCtrl', ['DataService', '$scope', WorkoutsCtrl]
