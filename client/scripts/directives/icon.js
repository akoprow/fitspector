(function() {
  'use strict';
  var IconDirective;

  IconDirective = (function() {
    function IconDirective() {
      return {
        replace: true,
        restrict: 'E',
        template: '<span class="glyphicon"></span>',
        link: function(scope, elt, attr) {
          return attr.$observe('type', function(type) {
            var iconId;
            iconId = (function() {
              switch (type) {
                case 'distance':
                  return 'road';
                case 'elevation':
                  return 'chevron-up';
                case 'hr':
                  return 'heart';
                case 'intensity':
                  return 'tint';
                case 'pace':
                  return 'dashboard';
                case 'sessions':
                  return 'ok';
                case 'time':
                  return 'time';
                default:
                  throw new Error("Unknown icon type: " + scope.type);
              }
            })();
            return elt.addClass("glyphicon-" + iconId);
          });
        }
      };
    }

    return IconDirective;

  })();

  angular.module('fitspector').directive('icon', [IconDirective]);

}).call(this);
