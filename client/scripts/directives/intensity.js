(function() {
  'use strict';
  var IntensityDirective;

  IntensityDirective = (function() {
    function IntensityDirective() {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'views/directives/intensity.html',
        scope: {
          value: '=',
          noIcon: '@'
        }
      };
    }

    return IntensityDirective;

  })();

  angular.module('fitspector').directive('intensity', [IntensityDirective]);

}).call(this);
