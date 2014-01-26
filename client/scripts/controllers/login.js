(function() {
  'use strict';
  var LoginCtrl;

  LoginCtrl = (function() {
    function LoginCtrl($scope, $window) {
      $scope.loginRunKeeper = function() {
        return $window.location.href = '/auth/runkeeper';
      };
    }

    return LoginCtrl;

  })();

  angular.module('fitspector').controller('LoginCtrl', ['$scope', '$window', LoginCtrl]);

}).call(this);
