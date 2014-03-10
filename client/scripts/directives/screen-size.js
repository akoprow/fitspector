(function() {
  'use strict';
  var ScreenSizeDirective;

  ScreenSizeDirective = (function() {
    function ScreenSizeDirective() {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'views/directives/screen-size.html'
      };
    }

    return ScreenSizeDirective;

  })();

  angular.module('fitspector').directive('screenSize', [ScreenSizeDirective]);

}).call(this);
