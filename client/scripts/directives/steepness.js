(function() {
  'use strict';
  var SteepnessDirective;

  SteepnessDirective = (function() {
    function SteepnessDirective() {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'views/directives/steepness.html',
        scope: {
          value: '='
        }
      };
    }

    return SteepnessDirective;

  })();

  angular.module('fitspector').directive('steepness', [SteepnessDirective]);

}).call(this);
