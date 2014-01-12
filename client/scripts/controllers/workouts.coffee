'use strict'

class WorkoutsCtrl
  constructor: (WorkoutsProviderService, $scope) ->

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
      timeRange = WorkoutsProviderService.getWorkoutsTimeRange()
      while ($scope.timeStart.isAfter timeRange.end)
        $scope.prev()
      while ($scope.timeEnd().isBefore timeRange.beg)
        $scope.next()
      updateTimeDesc()

    $scope.next = ->
      timeMove 1, $scope.timeStart
      updateTimeDesc()

    $scope.nextDisabled = ->
      (timeMove 1, $scope.timeStart.clone()).isAfter WorkoutsProviderService.getWorkoutsTimeRange().end

    $scope.prev = ->
      timeMove -1, $scope.timeStart
      updateTimeDesc()

    $scope.prevDisabled = ->
      (timeMove -1, $scope.timeEnd()).isBefore WorkoutsProviderService.getWorkoutsTimeRange().beg

    $scope.goNow = ->
      $scope.timeStart = moment()
      timeMove 0, $scope.timeStart
      updateTimeDesc()

    $scope.timeEnd = ->
       timeMove 1, $scope.timeStart.clone()

    $scope.goNow()
    $scope.setMode 'week'

    # ----- List of workouts (passing filters) -----

    recomputeWorkoutsFilter = =>
      timeBeg = $scope.timeStart
      timeEnd = $scope.timeEnd()
      sportFilter = $scope.sportFilter

      # TODO(koper) Consider making those into standard filters and moving them to the Data service.
      WorkoutsProviderService.setWorkoutsFilter (workout) ->
        beforeEnd = workout.startTime.isBefore timeEnd
        afterStart = (workout.startTime.isAfter timeBeg) || (workout.startTime.isSame timeBeg)
        passingSportFilter = sportFilter == 'all' || workout.exerciseType == sportFilter
        return beforeEnd && afterStart && passingSportFilter

    $scope.sportFilter = 'all'
    $scope.setSportFilter = (sport) ->
      $scope.sportFilter = sport
    $scope.$watch 'sportFilter', recomputeWorkoutsFilter

    $scope.$watch 'timeStart.valueOf()', recomputeWorkoutsFilter
    $scope.$watch 'mode', recomputeWorkoutsFilter

    WorkoutsProviderService.setWorkoutsListener ->
      $scope.$digest()  # Time boundaries might have changed, changing outcomes
                        # of nextDisabled() or prevDisabled()

    WorkoutsProviderService.setSelectedWorkoutsListener (workouts) ->
      $scope.workouts = workouts

    # ----- Sorting -----
    $scope.order = '-startTime'

    $scope.orderBy = (newOrder) ->
      newOrderRev = "-#{newOrder}"
      $scope.order = if $scope.order == newOrderRev then newOrder else newOrderRev

angular.module('fitspector').controller 'WorkoutsCtrl', ['WorkoutsProviderService', '$scope', WorkoutsCtrl]

