'use strict'

class SportIconDirective
  constructor: (WorkoutsProviderService) ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/sport-icon.html'
      scope:
        sportId: '='
      link: ($scope) ->
        setName = ->
          $scope.sportName = WorkoutsProviderService.getSportName $scope.sportId
        $scope.$watch 'sportId', setName
    }

angular.module('fitspector').directive 'sportIcon', ['WorkoutsProviderService', SportIconDirective]
