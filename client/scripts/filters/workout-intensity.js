(function() {
  'use strict';
  var WorkoutIntensity;

  WorkoutIntensity = (function() {
    function WorkoutIntensity() {
      return function(intensity) {
        return intensity.value().toFixed(0);
      };
    }

    return WorkoutIntensity;

  })();

  angular.module('fitspector').filter('workoutIntensity', [WorkoutIntensity]);

}).call(this);
