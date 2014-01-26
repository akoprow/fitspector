(function() {
  'use strict';
  var DistanceDirective;

  DistanceDirective = (function() {
    function DistanceDirective() {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'views/directives/distance.html',
        scope: {
          value: '=',
          noIcon: '@'
        }
      };
    }

    return DistanceDirective;

  })();

  angular.module('fitspector').directive('distance', [DistanceDirective]);

}).call(this);
