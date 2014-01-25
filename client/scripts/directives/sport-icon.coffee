'use strict'

class SportIconDirective
  constructor: (WorkoutsProviderService) ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/sport-icon.html'
      scope:
        exerciseType: '='
    }

angular.module('fitspector').directive 'sportIcon', ['WorkoutsProviderService', SportIconDirective]
