'use strict'

class NumberWatchersDirective
  constructor: ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/number-watchers.html'      
      link: (scope) ->
        scope.getNumWatchers = ->
          watchers = []

          process = (element) ->
            if element.data().hasOwnProperty '$scope'
              angular.forEach element.data().$scope.$$watchers, (watcher) ->
                watchers.push watcher
            angular.forEach element.children(), (childElement) ->
              process($(childElement))

          process $(document.getElementsByTagName 'body')
          return watchers.length
    }


angular.module('fitspector').directive 'numberWatchers', [NumberWatchersDirective]
