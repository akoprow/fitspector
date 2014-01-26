(function() {
  'use strict';
  var WorkoutDistance;

  WorkoutDistance = (function() {
    function WorkoutDistance() {
      return function(distance, format) {
        var value;
        if (distance == null) {
          return '';
        }
        value = (function() {
          switch (format) {
            case 'meters':
              return distance.asMeters();
            default:
              return distance.asKilometers();
          }
        })();
        if (value >= 10) {
          return value.toFixed(0);
        } else {
          return value.toFixed(1);
        }
      };
    }

    return WorkoutDistance;

  })();

  angular.module('fitspector').filter('workoutDistance', [WorkoutDistance]);

}).call(this);
