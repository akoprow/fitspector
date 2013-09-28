'use strict'

class LoginRunKeeperCtrl
  constructor: ($scope, $location, $http, $routeParams, LoginService) ->
    code = $routeParams.code
    success = (user) ->
      LoginService.setUser user.id
      $location.url '/'
    error = (err) -> # TODO(koper)
    $http.get('/api/login_rk/' + code).success(success).error(error)


angular.module('fitspector').controller 'LoginRunKeeperCtrl', ['$scope', '$location', '$http', '$routeParams', 'LoginService', LoginRunKeeperCtrl]
