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
            when 'time' then 'time'
            when 'elevation' then 'chevron-up'
            when 'intensity' then 'tint'
            when 'pace' then 'dashboard'
            else throw new Error "Unknown icon type: #{scope.type}"
        elt.addClass "glyphicon-#{iconId}"
    }

angular.module('fitspector').directive 'icon', [IconDirective]
