'use strict'

class PaceDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/pace.html'
      scope:
        value: '='
        noIcon: '@'
    }

angular.module('fitspector').directive 'pace', [PaceDirective]
