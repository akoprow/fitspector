'use strict'

class IconDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      template: '<span class="glyphicon"></span>'
      link: (scope, elt) ->
        iconId =
          switch elt.attr 'type'
            when 'distance' then 'road'
            when 'elevation' then 'chevron-up'
            when 'hr' then 'heart'
            when 'intensity' then 'tint'
            when 'pace' then 'dashboard'
            when 'sessions' then 'ok'
            when 'time' then 'time'
            else throw new Error "Unknown icon type: #{scope.type}"
        elt.addClass "glyphicon-#{iconId}"
    }

angular.module('fitspector').directive 'icon', [IconDirective]
