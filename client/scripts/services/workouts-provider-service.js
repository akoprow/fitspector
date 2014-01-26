(function() {
  'use strict';
  var WorkoutsProviderService;

  WorkoutsProviderService = (function() {
    function WorkoutsProviderService($rootScope, AuthService, DataProviderService) {
      var changeUser, newWorkout, reset, updateViews,
        _this = this;
      this.workoutsListener = function() {};
      this.selectedWorkoutsListener = function() {};
      this.workoutFilter = function(workout) {
        return true;
      };
      reset = function() {
        _this.firstWorkout = moment();
        _this.workouts = [];
        return _this.selectedWorkouts = [];
      };
      reset();
      updateViews = _.debounce((function() {
        return $rootScope.$digest();
      }), 100);
      newWorkout = function(dbWorkout) {
        var workout;
        workout = new Workout(dbWorkout.val(), dbWorkout.name());
        _this.workouts.push(workout);
        _this.workoutsListener(_this.workouts);
        if (_this.workoutsFilter(workout)) {
          _this.selectedWorkouts.push(workout);
          _this.selectedWorkoutsListener(_this.selectedWorkouts);
        }
        if (workout.startTime.isBefore(_this.firstWorkout)) {
          _this.firstWorkout = workout.startTime;
        }
        return updateViews();
      };
      changeUser = function(user) {
        var workoutsRef;
        if (typeof workoutsRef !== "undefined" && workoutsRef !== null) {
          workoutsRef.off();
        }
        if (user.id != null) {
          workoutsRef = DataProviderService.getFirebaseRoot().child('users').child(user.id).child('workouts');
          reset();
          return workoutsRef.on('child_added', newWorkout);
        }
      };
      AuthService.registerUserChangeListener(changeUser);
      return {
        getWorkoutsTimeRange: function() {
          return {
            beg: _this.firstWorkout,
            end: moment()
          };
        },
        getAllWorkouts: function() {
          return _this.workouts;
        },
        getSelectedWorkouts: function() {
          return _this.selectedWorkouts;
        },
        setWorkoutsFilter: function(workoutsFilter) {
          _this.workoutsFilter = workoutsFilter;
          _this.selectedWorkouts = _(_this.workouts).filter(_this.workoutsFilter);
          return _this.selectedWorkoutsListener(_this.selectedWorkouts);
        }
      };
    }

    return WorkoutsProviderService;

  })();

  angular.module('fitspector').service('WorkoutsProviderService', ['$rootScope', 'AuthService', 'DataProviderService', WorkoutsProviderService]);

}).call(this);
