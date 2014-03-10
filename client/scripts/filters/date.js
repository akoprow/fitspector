(function() {
  'use strict';
  var DateFilter;

  DateFilter = (function() {
    function DateFilter() {
      var format;
      format = d3.time.format('%d/%m/%Y');
      return function(date) {
        return format(new Date(date));
      };
    }

    return DateFilter;

  })();

  angular.module('fitspector').filter('date', [DateFilter]);

}).call(this);
