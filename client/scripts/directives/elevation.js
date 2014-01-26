(function() {
  'use strict';
  var ElevationDirective;

  ElevationDirective = (function() {
    function ElevationDirective() {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'views/directives/elevation.html',
        scope: {
          value: '=',
          noIcon: '@'
        }
      };
    }

    return ElevationDirective;

  })();

  angular.module('fitspector').directive('elevation', [ElevationDirective]);

}).call(this);
