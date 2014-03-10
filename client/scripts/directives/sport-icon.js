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
          exerciseTypeId: '@'
        },
        link: function(scope) {
          return scope.$watch('exerciseTypeId', function(exerciseTypeId) {
            if (exerciseTypeId != null) {
              return scope.exerciseType = WorkoutType[exerciseTypeId];
            }
          });
        }
      };
    }

    return SportIconDirective;

  })();

  angular.module('fitspector').directive('sportIcon', ['WorkoutsProviderService', SportIconDirective]);

}).call(this);
