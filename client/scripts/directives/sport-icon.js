(function() {
  'use strict';
  var SportIconDirective;

  SportIconDirective = (function() {
    function SportIconDirective(WorkoutsProviderService) {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'views/directives/sport-icon.html',
        scope: {
          exerciseType: '='
        }
      };
    }

    return SportIconDirective;

  })();

  angular.module('fitspector').directive('sportIcon', ['WorkoutsProviderService', SportIconDirective]);

}).call(this);
