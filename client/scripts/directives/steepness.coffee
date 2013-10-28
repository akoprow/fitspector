'use strict'

class SteepnessDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/steepness.html'
      scope:
        value: '='
    }

angular.module('fitspector').directive 'steepness', [SteepnessDirective]
