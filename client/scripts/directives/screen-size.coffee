'use strict'

class ScreenSizeDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/screen-size.html'
    }

angular.module('fitspector').directive 'screenSize', [ScreenSizeDirective]
