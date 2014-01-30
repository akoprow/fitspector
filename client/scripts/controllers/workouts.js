(function() {
  'use strict';
  var WORKOUTS_PAGE_SIZE, WorkoutsCtrl;

  WORKOUTS_PAGE_SIZE = 30;

  WorkoutsCtrl = (function() {
    function WorkoutsCtrl(WorkoutsProviderService, $scope) {
      var adjustTime, recomputeWorkoutsFilter, timeMove, updateTimeDesc,
        _this = this;
      $scope.maxGaugeTime = new Time({
        hours: 2
      });
      $scope.maxGaugeDistance = new Distance({
        km: 20
      });
      $scope.gaugeModes = [
        {
          id: 'numbers',
          desc: 'Numbers'
        }, {
          id: 'gauges',
          desc: 'Gauges'
        }, {
          id: 'both',
          desc: 'Both'
        }
      ];
      $scope.gaugeSettings = {
        mode: 'both',
        selectedWorkout: ''
      };
      $scope.timeModes = [
        {
          id: 'week',
          desc: 'Week'
        }, {
          id: 'month',
          desc: 'Month'
        }, {
          id: 'year',
          desc: 'Year'
        }, {
          id: 'all',
          desc: 'All'
        }
      ];
      updateTimeDesc = function() {
        var timeEnd;
        switch ($scope.timeMode.id) {
          case 'year':
            $scope.timeMode.desc = $scope.timeStart.format('YYYY');
            break;
          case 'month':
            $scope.timeMode.desc = $scope.timeStart.format('MMM YYYY');
            break;
          case 'week':
            $scope.timeMode.desc = $scope.timeStart.format('W / gggg');
            break;
          case 'all':
            $scope.timeMode.desc = 'All workouts';
            break;
          default:
            throw new Error("Unknown time mode " + $scope.timeMode.id);
        }
        return $scope.timeMode.fullDesc = $scope.timeMode.id === 'week' ? (timeEnd = $scope.timeEnd().subtract('days', 1), "" + ($scope.timeStart.format('LL')) + " — " + (timeEnd.format('LL'))) : '';
      };
      adjustTime = function(time) {
        switch ($scope.timeMode.id) {
          case 'year':
            return time.startOf('year');
          case 'month':
            return time.startOf('month');
          case 'week':
            return time.startOf('week');
          case 'all':
            return time = WorkoutsProviderService.getWorkoutsTimeRange().beg;
          default:
            throw new Error("Unknown time mode " + $scope.timeMode.id);
        }
      };
      timeMove = function(delta, time) {
        switch ($scope.timeMode.id) {
          case 'year':
            time.add('years', delta);
            break;
          case 'month':
            time.add('months', delta);
            break;
          case 'week':
            time.add('weeks', delta);
            break;
          case 'all':
            break;
          default:
            throw new Error("Unknown time mode " + $scope.timeMode.id);
        }
        return adjustTime(time);
      };
      $scope.setTimeMode = function(newTimeMode) {
        var timeRange;
        $scope.timeMode = {
          id: newTimeMode
        };
        adjustTime($scope.timeStart);
        timeRange = WorkoutsProviderService.getWorkoutsTimeRange();
        while ($scope.timeStart.isAfter(timeRange.end)) {
          $scope.prev();
        }
        while ($scope.timeEnd().isBefore(timeRange.beg)) {
          $scope.next();
        }
        return updateTimeDesc();
      };
      $scope.next = function() {
        timeMove(1, $scope.timeStart);
        return updateTimeDesc();
      };
      $scope.nextDisabled = function() {
        return (timeMove(1, $scope.timeStart.clone())).isAfter(WorkoutsProviderService.getWorkoutsTimeRange().end);
      };
      $scope.prev = function() {
        timeMove(-1, $scope.timeStart);
        return updateTimeDesc();
      };
      $scope.prevDisabled = function() {
        return (timeMove(-1, $scope.timeEnd())).isBefore(WorkoutsProviderService.getWorkoutsTimeRange().beg);
      };
      $scope.goNow = function() {
        $scope.timeStart = moment();
        timeMove(0, $scope.timeStart);
        return updateTimeDesc();
      };
      $scope.timeEnd = function() {
        if ($scope.timeMode.id === 'all') {
          return WorkoutsProviderService.getWorkoutsTimeRange().end;
        } else {
          return timeMove(1, $scope.timeStart.clone());
        }
      };
      $scope.timeStart = moment();
      $scope.setTimeMode('month');
      $scope.goNow();
      $scope.infiniteScrollingPosition = 0;
      $scope.scrollWorkouts = function() {
        return $scope.infiniteScrollingPosition += WORKOUTS_PAGE_SIZE;
      };
      recomputeWorkoutsFilter = function() {
        var sportFilter, timeBeg, timeEnd;
        $scope.infiniteScrollingPosition = WORKOUTS_PAGE_SIZE;
        timeBeg = $scope.timeStart;
        timeEnd = $scope.timeEnd();
        sportFilter = $scope.sportFilter;
        return WorkoutsProviderService.setWorkoutsFilter(function(workout) {
          var afterStart, beforeEnd, passingSportFilter;
          passingSportFilter = sportFilter === 'all' || workout.exerciseType.id === sportFilter;
          if ($scope.timeMode.id === 'all') {
            return passingSportFilter;
          } else {
            beforeEnd = workout.startTime.isBefore(timeEnd);
            afterStart = (workout.startTime.isAfter(timeBeg)) || (workout.startTime.isSame(timeBeg));
            return beforeEnd && afterStart && passingSportFilter;
          }
        });
      };
      $scope.getWorkouts = function() {
        return WorkoutsProviderService.getSelectedWorkouts();
      };
      $scope.sportFilter = 'all';
      $scope.setSportFilter = function(exerciseTypeId) {
        return $scope.sportFilter = exerciseTypeId;
      };
      $scope.$watch('sportFilter', recomputeWorkoutsFilter);
      $scope.$watch('timeStart.valueOf()', recomputeWorkoutsFilter);
      $scope.$watch('timeMode', recomputeWorkoutsFilter);
      $scope.order = '-startTime';
      $scope.orderBy = function(newOrder) {
        var newOrderRev;
        newOrderRev = "-" + newOrder;
        return $scope.order = $scope.order === newOrderRev ? newOrder : newOrderRev;
      };
    }

    return WorkoutsCtrl;

  })();

  angular.module('fitspector').controller('WorkoutsCtrl', ['WorkoutsProviderService', '$scope', WorkoutsCtrl]);

}).call(this);
