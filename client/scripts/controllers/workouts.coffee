'use strict'

class WorkoutsCtrl
  constructor: (DataService, $scope) ->

    # ----- Gauges -----
    # TODO(koper) Take this from user settings?
    $scope.maxGaugeTime = new Time {hours: 2}
    $scope.maxGaugeDistance = new Distance {km: 20}

    # ----- Gauge displaying type -----

    $scope.gaugeSettings =
      mode: 'both'
      selectedWorkout: ''

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

    $scope.setMode = (newMode) =>
      $scope.mode = newMode
      adjustTime $scope.timeStart
      timeRange = DataService.getWorkoutsTimeRange()
      while ($scope.timeStart.isAfter timeRange.end)
        $scope.prev()
      while ($scope.timeEnd().isBefore timeRange.beg)
        $scope.next()
      updateTimeDesc()

    $scope.next = ->
      timeMove 1, $scope.timeStart
      updateTimeDesc()

    $scope.nextDisabled = ->
      (timeMove 1, $scope.timeStart.clone()).isAfter DataService.getWorkoutsTimeRange().end

    $scope.prev = ->
      timeMove -1, $scope.timeStart
      updateTimeDesc()

    $scope.prevDisabled = ->
      (timeMove -1, $scope.timeEnd()).isBefore DataService.getWorkoutsTimeRange().beg

    $scope.goNow = ->
      $scope.timeStart = moment()
      timeMove 0, $scope.timeStart
      updateTimeDesc()

    $scope.timeEnd = ->
       timeMove 1, $scope.timeStart.clone()

    $scope.goNow()
    $scope.setMode 'week'

    # ----- List of workouts (passing filters) -----

    updateTimeRange = =>
      timeBeg = $scope.timeStart
      timeEnd = $scope.timeEnd()
      DataService.setWorkoutsFilter (workout) ->
        (workout.startTime.isBefore timeEnd) &&
          ((workout.startTime.isAfter timeBeg) || (workout.startTime.isSame timeBeg))        

    $scope.$watch 'timeStart.valueOf()', updateTimeRange
    $scope.$watch 'mode', updateTimeRange

    DataService.setWorkoutsListener ->
      $scope.$digest()  # Time boundaries might have changed, changing outcomes
                        # of nextDisabled() or prevDisabled()

    DataService.setSelectedWorkoutsListener (workouts) ->
      $scope.workouts = workouts

    # ----- Sorting -----
    $scope.order = '-startTime'

    $scope.orderBy = (newOrder) ->
      newOrderRev = "-#{newOrder}"
      $scope.order = if $scope.order == newOrderRev then newOrder else newOrderRev

angular.module('fitspector').controller 'WorkoutsCtrl', ['DataService', '$scope', WorkoutsCtrl]

