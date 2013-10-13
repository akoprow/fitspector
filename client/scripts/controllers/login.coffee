'use strict'

class LoginCtrl
  constructor: ($scope, $window) ->
    $scope.loginRunKeeper = ->
      $window.location.href = '/auth/runkeeper'


angular.module('fitspector').controller 'LoginCtrl', ['$scope', '$window', LoginCtrl]
