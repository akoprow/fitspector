'use strict'

class HrDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/hr.html'
      scope:
        value: '='
        noIcon: '@'
    }

angular.module('fitspector').directive 'hr', [HrDirective]
