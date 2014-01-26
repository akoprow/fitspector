(function() {
  'use strict';
  var TimeDirective;

  TimeDirective = (function() {
    function TimeDirective() {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'views/directives/time.html',
        scope: {
          value: '=',
          noIcon: '@'
        }
      };
    }

    return TimeDirective;

  })();

  angular.module('fitspector').directive('time', [TimeDirective]);

}).call(this);
