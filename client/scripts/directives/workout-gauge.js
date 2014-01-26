(function() {
  'use strict';
  var WorkoutGaugeDirective;

  WorkoutGaugeDirective = (function() {
    function WorkoutGaugeDirective() {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'views/directives/workout-gauge.html',
        scope: {
          gaugeMax: '=',
          type: '@',
          zones: '='
        }
      };
    }

    return WorkoutGaugeDirective;

  })();

  angular.module('fitspector').directive('workoutGauge', [WorkoutGaugeDirective]);

}).call(this);
