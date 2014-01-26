(function() {
  'use strict';
  var SortingCtrlDirective;

  SortingCtrlDirective = (function() {
    function SortingCtrlDirective() {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'views/directives/sorting-ctrl.html',
        scope: {
          "this": '@',
          selected: '@'
        }
      };
    }

    return SortingCtrlDirective;

  })();

  angular.module('fitspector').directive('sortingCtrl', [SortingCtrlDirective]);

}).call(this);
