'use strict'

class IconDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/icon.html'
      scope:
        type: '@'
      link: (scope) ->
        scope.iconId =
          switch scope.type
            when 'distance' then 'road'
            when 'time' then 'time'
            when 'elevation' then 'chevron-up'
            when 'intensity' then 'tint'
            else throw new Error "Unknown icon type: #{scope.type}"
    }

angular.module('fitspector').directive 'icon', [IconDirective]
