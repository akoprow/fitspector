(function() {
  'use strict';
  var WorkoutDistanceGaugeDirective;

  WorkoutDistanceGaugeDirective = (function() {
    function WorkoutDistanceGaugeDirective() {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'views/directives/workout-distance-gauge.html',
        scope: {
          distance: '=',
          maxGaugeDistance: '='
        }
      };
    }

    return WorkoutDistanceGaugeDirective;

  })();

  angular.module('fitspector').directive('workoutDistanceGauge', [WorkoutDistanceGaugeDirective]);

}).call(this);
