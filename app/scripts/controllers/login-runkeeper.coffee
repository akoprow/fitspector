'use strict'

angular.module('fitspector')
  .controller 'RunKeeperLoginCtrl', ['$scope', '$http', '$routeParams', ($scope, $http, $routeParams) ->
    code = $routeParams.code
    $http.get ('/api/login_rk/' + code)
  ]
