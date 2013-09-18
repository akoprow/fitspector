'use strict'

class WorkoutsCtrl
  constructor: (DataService, $scope) ->
    # ----- Time navigation -----
# 
    # TODO(koper) Extract this into a time-selection service/controller?
    updateTimeDesc = ->
      switch $scope.mode
        when 'year'
          $scope.modeDesc = $scope.timeStart.format('YYYY')
        when 'month'
          $scope.modeDesc = $scope.timeStart.format('MMM YYYY')
        when 'week'
          $scope.modeDesc = $scope.timeStart.format('W / gggg')
      $scope.modeFullDesc =
        if $scope.mode == 'week'
          timeEnd = $scope.timeEnd().subtract 'days', 1
          "#{$scope.timeStart.format('LL')} — #{timeEnd.format('LL')}"
        else
          ''

    adjustTime = (time) ->
      switch $scope.mode
        when 'year'
          time.startOf 'year'
        when 'month'
          time.startOf 'month'
        when 'week'
          time.startOf 'week'

    timeMove = (delta, time) ->
      switch $scope.mode
        when 'year'
          time.add 'years', delta
        when 'month'
          time.add 'months', delta
        when 'week'
          time.add 'weeks', delta
      adjustTime time

    $scope.setMode = (newMode) ->
      $scope.mode = newMode
      adjustTime $scope.timeStart
      updateTimeDesc()

    $scope.next = ->
      timeMove 1, $scope.timeStart
      updateTimeDesc()

    $scope.prev = ->
      timeMove -1, $scope.timeStart
      updateTimeDesc()

    $scope.goNow = ->
      $scope.timeStart = moment()
      timeMove 0, $scope.timeStart
      updateTimeDesc()

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
