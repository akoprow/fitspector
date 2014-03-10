(function() {
  'use strict';
  var NavigationCtrl;

  NavigationCtrl = (function() {
    NavigationCtrl.urls = {
      analyze: '/analyze',
      login: '/login',
      compare: '/compare',
      workouts: '/workouts'
    };

    function NavigationCtrl($location, $scope, AuthService) {
      var _this = this;
      $scope.isAt = function(id) {
        return $location.path() === NavigationCtrl.urls[id];
      };
      $scope.goTo = function(id) {
        return $location.path(NavigationCtrl.urls[id]);
      };
      $scope.getUser = function() {
        return AuthService.getUser();
      };
      $scope.logout = function() {
        return AuthService.logout(function() {
          return $location.path('/');
        });
      };
    }

    return NavigationCtrl;

  })();

  angular.module('fitspector').controller('NavigationCtrl', ['$location', '$scope', 'AuthService', NavigationCtrl]);

}).call(this);
