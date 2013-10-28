'use strict'

class IntensityDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/intensity.html'
      scope:
        value: '='
        noIcon: '@'
    }

angular.module('fitspector').directive 'intensity', [IntensityDirective]
