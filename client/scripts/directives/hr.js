(function() {
  'use strict';
  var HrDirective;

  HrDirective = (function() {
    function HrDirective() {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'views/directives/hr.html',
        scope: {
          value: '=',
          noIcon: '@'
        }
      };
    }

    return HrDirective;

  })();

  angular.module('fitspector').directive('hr', [HrDirective]);

}).call(this);
