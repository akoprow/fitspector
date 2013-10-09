'use strict'

class SortingCtrlDirective
  constructor:  ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/sorting-ctrl.html'
      scope:
        this: '@'
        selected: '@'
    }

angular.module('fitspector').directive 'sortingCtrl', [SortingCtrlDirective]
