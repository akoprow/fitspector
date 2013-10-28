'use strict'

class TimeDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/time.html'
      scope:
        value: '='
        noIcon: '@'
    }

angular.module('fitspector').directive 'time', [TimeDirective]
