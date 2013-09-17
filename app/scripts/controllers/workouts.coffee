'use strict'

class WorkoutsCtrl
  constructor: (DataService, $scope) ->
    # ----- Time navigation -----
# 
    # TODO(koper) Extract this into a time-selection service/controller?
    updateTime = ->
      switch $scope.mode
        when 'year'
          $scope.modeDesc = $scope.timeStart.format('YYYY')
        when 'month'
          $scope.modeDesc = $scope.timeStart.format('MMM YYYY')
        when 'week'
          $scope.modeDesc = $scope.timeStart.format('W / gggg')

    timeMove = (delta, time) ->
      switch $scope.mode
        when 'year'
          time.year ($scope.timeStart.year() + delta)
          time.startOf 'year'
        when 'month'
          time.month ($scope.timeStart.month() + delta)
          time.startOf 'month'
        when 'week'
          time.week ($scope.timeStart.week() + delta)
          time.startOf 'week'

    $scope.setMode = (newMode) ->
      $scope.mode = newMode
      updateTime()

    $scope.next = ->
      timeMove 1, $scope.timeStart
      updateTime()

    $scope.prev = ->
      timeMove -1, $scope.timeStart
      updateTime()

    $scope.goNow = ->
      $scope.timeStart = moment()
      timeMove 0, $scope.timeStart
      updateTime()

    $scope.timeEnd = ->
      timeMove 1, $scope.timeStart.clone()

    $scope.goNow()
    $scope.setMode 'year'

    # ----- List of workouts (passing filters) -----
    $scope.getWorkouts = ->
      timeBeg = $scope.timeStart
      timeEnd = $scope.timeEnd()

      withinTimeRange = (workout) ->
        (workout.startedAt.isBefore timeEnd) &&
          ((workout.startedAt.isAfter timeBeg) || (workout.startedAt.isSame timeBeg))
      _(DataService.getAllWorkouts()).filter withinTimeRange

    # ----- Sorting -----
    $scope.order = '-startedAt'

    $scope.orderBy = (newOrder) ->
      $scope.order = if $scope.order == newOrder then "-#{newOrder}" else newOrder

angular.module('fitspector').controller 'WorkoutsCtrl', ['DataService', '$scope', WorkoutsCtrl]
