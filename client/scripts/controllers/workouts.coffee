'use strict'

class WorkoutsCtrl
  constructor: (DataService, $scope, $rootScope) ->
    # ----- Gauges -----
    # TODO(koper) Make this dependant on user data.
    # TODO(koper) Make better constructors {hours: 2}, {km: 20}
    $scope.maxGaugeTime = new Time {hours: 2}
    $scope.maxGaugeDistance = new Distance {km: 20}

    # ----- Time navigation -----

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
    $scope.setMode 'week'

    # ----- List of workouts (passing filters) -----

    recomputeWorkouts = ->
      timeBeg = $scope.timeStart
      timeEnd = $scope.timeEnd()

      withinTimeRange = (workout) ->
        (workout.startTime.isBefore timeEnd) &&
          ((workout.startTime.isAfter timeBeg) || (workout.startTime.isSame timeBeg))
      $scope.workouts = _($rootScope.allWorkouts).filter withinTimeRange

    $rootScope.$watch 'allWorkouts', recomputeWorkouts
    $scope.$watch 'timeStart.valueOf()', recomputeWorkouts
    $scope.$watch 'mode', recomputeWorkouts

    # ----- Sorting -----
    $scope.order = '-startTime'

    $scope.orderBy = (newOrder) ->
      newOrderRev = "-#{newOrder}"
      $scope.order = if $scope.order == newOrderRev then newOrder else newOrderRev

angular.module('fitspector').controller 'WorkoutsCtrl', ['DataService', '$scope', '$rootScope', WorkoutsCtrl]
