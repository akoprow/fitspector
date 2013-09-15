'use strict'

class SportIconDirective
  constructor: (DataService) ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/sport-icon.html'
      scope:
        sportId: '='
      link: ($scope) ->
        $scope.sportName = DataService.getSportName($scope.sportId)
    }

angular.module('fitspector').directive 'sportIcon', ['DataService', SportIconDirective]
