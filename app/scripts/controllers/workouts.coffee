'use strict'

class WorkoutsCtrl
  constructor: (DataService, $scope) ->
    $scope.allWorkouts = -> DataService.getAllWorkouts()

    $scope.order = '-startedAt'

    # TODO(koper) Extract this into a time-selection service/controller?
    updateTime = ->
      switch $scope.mode
        when 'year' then $scope.modeDesc = $scope.timeStart.format('YYYY')
        when 'month' then $scope.modeDesc = $scope.timeStart.format('MMM YYYY')
        when 'week' then $scope.modeDesc = $scope.timeStart.format('W / gggg')

    timeMove = (delta) ->
      switch $scope.mode
        when 'year' then $scope.timeStart.year ($scope.timeStart.year() + delta)
        when 'month' then $scope.timeStart.month ($scope.timeStart.month() + delta)
        when 'week' then $scope.timeStart.week ($scope.timeStart.week() + delta)
      updateTime()

    $scope.setMode = (newMode) ->
      $scope.mode = newMode
      updateTime()

    $scope.next = -> timeMove 1
    $scope.prev = -> timeMove -1
    $scope.goNow = ->
      $scope.timeStart = moment()
      updateTime()

    $scope.goNow()
    $scope.setMode 'year'

    $scope.orderBy = (newOrder) ->
      $scope.order = if $scope.order == newOrder then "-#{newOrder}" else newOrder

angular.module('fitspector').controller 'WorkoutsCtrl', ['DataService', '$scope', WorkoutsCtrl]
