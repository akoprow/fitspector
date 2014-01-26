(function() {
  'use strict';
  var WorkoutTime;

  WorkoutTime = (function() {
    function WorkoutTime() {
      return function(time, format) {
        var h, l, p, _ref;
        if (time == null) {
          return '';
        }
        _ref = (function() {
          switch (format) {
            case 'short':
              return [time.minutes(), time.seconds()];
            default:
              return [time.hours(), time.minutes()];
          }
        })(), h = _ref[0], l = _ref[1];
        p = l < 10 ? '0' : '';
        return "" + h + ":" + p + l;
      };
    }

    return WorkoutTime;

  })();

  angular.module('fitspector').filter('workoutTime', [WorkoutTime]);

}).call(this);
