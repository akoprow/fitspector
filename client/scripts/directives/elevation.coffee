'use strict'

class ElevationDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/elevation.html'
      scope:
        value: '='
        noIcon: '@'
    }

angular.module('fitspector').directive 'elevation', [ElevationDirective]
