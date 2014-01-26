(function() {
  'use strict';
  var WorkoutElevation;

  WorkoutElevation = (function() {
    function WorkoutElevation() {
      return function(distance) {
        if (distance == null) {
          return '';
        }
        return (distance.asKilometers() * 1000).toFixed(0);
      };
    }

    return WorkoutElevation;

  })();

  angular.module('fitspector').filter('workoutElevation', [WorkoutElevation]);

}).call(this);
