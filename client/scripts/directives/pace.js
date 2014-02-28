(function() {
  'use strict';
  var PaceDirective;

  PaceDirective = (function() {
    function PaceDirective() {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'views/directives/pace.html',
        scope: {
          exerciseType: '=',
          value: '=',
          noIcon: '@'
        },
        link: function(scope) {
          return scope.showPaceAsMinKm = (function() {
            switch (scope.exerciseType.id) {
              case 'run':
                return true;
              case 'hik':
                return true;
              default:
                return false;
            }
          })();
        }
      };
    }

    return PaceDirective;

  })();

  angular.module('fitspector').directive('pace', [PaceDirective]);

}).call(this);
