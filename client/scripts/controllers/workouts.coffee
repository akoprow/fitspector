'use strict'

WORKOUTS_PAGE_SIZE = 30

class WorkoutsCtrl
  constructor: (WorkoutsProviderService, $scope) ->

    # ------------------------------------------- Gauges -------------------------------------------
    # TODO(koper) Take this from user settings?
    $scope.maxGaugeTime = new Time { hours: 2 }
    $scope.maxGaugeDistance = new Distance { km: 20 }

    $scope.gaugeModes = [
      id: 'numbers'
      desc: 'Numbers'
    ,
      id: 'gauges'
      desc: 'Gauges'
    ,
      id: 'both'
      desc: 'Both'
    ]

    $scope.gaugeSettings =
      mode: 'both'
      selectedWorkout: ''

    # --------------------------------------- Time navigation --------------------------------------

    $scope.timeModes = [
      id: 'week'
      desc: 'Week'
    ,
      id: 'month'
      desc: 'Month'
    ,
      id: 'year'
      desc: 'Year'
    ,
      id: 'all'
      desc: 'All'
    ]

    # TODO(koper) Extract this into a time-selection service/controller?
    updateTimeDesc = ->
      switch $scope.timeMode.id
        when 'year'
          $scope.timeMode.desc = $scope.timeStart.format('YYYY')
        when 'month'
          $scope.timeMode.desc = $scope.timeStart.format('MMM YYYY')
        when 'week'
          $scope.timeMode.desc = $scope.timeStart.format('W / gggg')
        when 'all'
          $scope.timeMode.desc = 'All workouts'
        else
          throw new Error "Unknown time mode #{$scope.timeMode.id}"
      $scope.timeMode.fullDesc =
        if $scope.timeMode.id == 'week'
          timeEnd = $scope.timeEnd().subtract 'days', 1
          "#{$scope.timeStart.format('LL')} — #{timeEnd.format('LL')}"
        else
          ''

    adjustTime = (time) ->
      switch $scope.timeMode.id
        when 'year'
          time.startOf 'year'
        when 'month'        
          time.startOf 'month'
        when 'week'
          time.startOf 'week'
        when 'all'
          time = WorkoutsProviderService.getWorkoutsTimeRange().beg
        else throw new Error "Unknown time mode #{$scope.timeMode.id}"

    timeMove = (delta, time) ->
      switch $scope.timeMode.id
        when 'year'
          time.add 'years', delta
        when 'month'
          time.add 'months', delta
        when 'week'
          time.add 'weeks', delta
        when 'all'
          ;
        else throw new Error "Unknown time mode #{$scope.timeMode.id}"
      adjustTime time

    $scope.setTimeMode = (newTimeMode) =>
      $scope.timeMode = { id: newTimeMode }
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
      if $scope.timeMode.id == 'all'
        WorkoutsProviderService.getWorkoutsTimeRange().end
      else
        timeMove 1, $scope.timeStart.clone()

    $scope.timeStart = moment()
    $scope.setTimeMode 'month'
    $scope.goNow()

    # ----------------------------- List of workouts (passing filters) -----------------------------

    $scope.infiniteScrollingPosition = 0
    $scope.visibleWorkouts = []

    $scope.scrollWorkouts = =>
      $scope.infiniteScrollingPosition += WORKOUTS_PAGE_SIZE

    recomputeVisibleWorkouts = =>
      $scope.infiniteScrollingPosition = WORKOUTS_PAGE_SIZE
      timeBeg = $scope.timeStart
      timeEnd = $scope.timeEnd()
      sportFilter = $scope.sportFilter

      # TODO(koper) Consider making those into standard filters and moving them to the Data service.
      $scope.visibleWorkouts =
        _(WorkoutsProviderService.getAllWorkouts()).filter (workout) ->
          passingSportFilter = sportFilter == 'all' || workout.exerciseType.id == sportFilter
          if $scope.timeMode.id == 'all'
            passingSportFilter
          else
            beforeEnd = workout.startTime.isBefore timeEnd
            afterStart = (workout.startTime.isAfter timeBeg) || (workout.startTime.isSame timeBeg)
            beforeEnd && afterStart && passingSportFilter

      _.defer -> $scope.$digest()

    $scope.sportFilter = 'all'
    $scope.setSportFilter = (exerciseTypeId) -> $scope.sportFilter = exerciseTypeId
    $scope.getFilteredSportName = -> WorkoutType[$scope.sportFilter].name

    $scope.$watch 'sportFilter', recomputeVisibleWorkouts
    $scope.$watch 'timeStart.valueOf()', recomputeVisibleWorkouts
    $scope.$watch 'timeMode', recomputeVisibleWorkouts
    $scope.$on 'workouts.update', recomputeVisibleWorkouts

    # ----- Sorting -----
    $scope.order = '-startTime'

    $scope.orderBy = (newOrder) ->
      newOrderRev = "-#{newOrder}"
      $scope.order = if $scope.order == newOrderRev then newOrder else newOrderRev


angular.module('fitspector').controller 'WorkoutsCtrl', ['WorkoutsProviderService', '$scope', WorkoutsCtrl]
