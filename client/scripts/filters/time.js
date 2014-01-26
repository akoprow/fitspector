(function() {
  'use strict';
  var TimeFilter;

  TimeFilter = (function() {
    function TimeFilter() {
      var format;
      format = d3.time.format('%H:%M');
      return function(date) {
        return format(new Date(date));
      };
    }

    return TimeFilter;

  })();

  angular.module('fitspector').filter('time', [TimeFilter]);

}).call(this);
