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
        setName = ->
          $scope.sportName = DataService.getSportName $scope.sportId
        $scope.$watch 'sportId', setName
    }

angular.module('fitspector').directive 'sportIcon', ['DataService', SportIconDirective]
