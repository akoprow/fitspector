'use strict'

class WorkoutsCtrl
  constructor: (DataService, $scope) ->
    # ----- Time navigation -----
    # TODO(koper) Extract this into a time-selection service/controller?
    updateTimeDesc = ->
      switch $scope.mode
        when 'year'
          $scope.modeDesc = $scope.timeBeg.format('YYYY')
        when 'month'
          $scope.modeDesc = $scope.timeBeg.format('MMM YYYY')
        when 'week'
          $scope.modeDesc = $scope.timeBeg.format('W / gggg')
      $scope.modeFullDesc =
        if $scope.mode == 'week'
          timeEnd = timeEnd().subtract 'days', 1
          "#{$scope.timeBeg.format('LL')} — #{timeEnd.format('LL')}"
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
      adjustTime $scope.timeBeg
      updateTimeDesc()

    $scope.next = ->
      timeMove 1, $scope.timeBeg
      updateTimeDesc()

    $scope.prev = ->
      timeMove -1, $scope.timeBeg
      updateTimeDesc()

    $scope.goNow = ->
      $scope.timeBeg = moment()
      timeMove 0, $scope.timeBeg
      updateTimeDesc()

    $scope.timeEnd = =>
       timeMove 1, $scope.timeBeg.clone()

    $scope.goNow()
    $scope.setMode 'year'

    # List of workouts passing the filter
    computeWorkouts = =>
      $scope.workouts = DataService.getWorkoutsWithinTimeRange
        timeBeg: $scope.timeBeg
        timeEnd: $scope.timeEnd()
    $scope.$watch 'timeBeg.valueOf()', computeWorkouts


angular.module('fitspector').controller 'WorkoutsCtrl', ['DataService', '$scope', WorkoutsCtrl]
