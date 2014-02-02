'use strict'

class PaceDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/pace.html'
      scope:
        exerciseType: '='
        value: '='
        noIcon: '@'
      link: (scope) ->
        scope.showPaceAsMinKm =
          switch scope.exerciseType.id
            when 'run' then true
            when 'hik' then true
            else false
    }

angular.module('fitspector').directive 'pace', [PaceDirective]
