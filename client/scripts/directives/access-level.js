(function() {
  'use strict';
  var AccessLevelDirective;

  AccessLevelDirective = (function() {
    function AccessLevelDirective(AuthService) {
      return {
        replace: true,
        restrict: 'A',
        link: function($scope, element, attrs) {
          var accessLevel, changeUser, originalDisplay;
          originalDisplay = element.css('display');
          accessLevel = attrs.accessLevel;
          changeUser = function(user) {
            var visible;
            visible = (function() {
              switch (accessLevel) {
                case 'guest':
                  return !AuthService.isLoggedIn();
                case 'user':
                  return AuthService.isLoggedIn();
              }
            })();
            return element.css('display', visible ? originalDisplay : 'none');
          };
          return AuthService.registerUserChangeListener(changeUser);
        }
      };
    }

    return AccessLevelDirective;

  })();

  angular.module('fitspector').directive('accessLevel', ['AuthService', AccessLevelDirective]);

}).call(this);
