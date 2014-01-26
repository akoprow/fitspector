(function() {
  'use strict';
  var NumberWatchersDirective;

  NumberWatchersDirective = (function() {
    function NumberWatchersDirective() {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'views/directives/number-watchers.html',
        link: function(scope) {
          return scope.getNumWatchers = function() {
            var process, watchers;
            watchers = [];
            process = function(element) {
              if (element.data().hasOwnProperty('$scope')) {
                angular.forEach(element.data().$scope.$$watchers, function(watcher) {
                  return watchers.push(watcher);
                });
              }
              return angular.forEach(element.children(), function(childElement) {
                return process($(childElement));
              });
            };
            process($(document.getElementsByTagName('body')));
            return watchers.length;
          };
        }
      };
    }

    return NumberWatchersDirective;

  })();

  angular.module('fitspector').directive('numberWatchers', [NumberWatchersDirective]);

}).call(this);
