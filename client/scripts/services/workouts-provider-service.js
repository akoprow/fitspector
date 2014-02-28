(function() {
  'use strict';
  var WorkoutsProviderService;

  WorkoutsProviderService = (function() {
    function WorkoutsProviderService($rootScope, AuthService, DataProviderService) {
      var changeUser, newWorkout, notifyUpdate, reset,
        _this = this;
      notifyUpdate = _.debounce((function() {
        return $rootScope.$broadcast('workouts.update');
      }), 100);
      reset = function() {
        _this.firstWorkout = moment();
        _this.workouts = [];
        return notifyUpdate();
      };
      reset();
      newWorkout = function(dbWorkout) {
        var workout;
        workout = new Workout(dbWorkout.val(), dbWorkout.name());
        _this.workouts.push(workout);
        if (workout.startTime.isBefore(_this.firstWorkout)) {
          _this.firstWorkout = workout.startTime;
        }
        return notifyUpdate();
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
        }
      };
    }

    return WorkoutsProviderService;

  })();

  angular.module('fitspector').service('WorkoutsProviderService', ['$rootScope', 'AuthService', 'DataProviderService', WorkoutsProviderService]);

}).call(this);
