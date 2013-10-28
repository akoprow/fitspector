'use strict'

class DistanceDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/distance.html'
      scope:
        value: '='
        noIcon: '@'
    }

angular.module('fitspector').directive 'distance', [DistanceDirective]
