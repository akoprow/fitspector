'use strict'

class SportIconDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/sport-icon.html'
      scope:
        sport: '@'
    }

angular.module('fitspector').directive 'sportIcon', [SportIconDirective]
        