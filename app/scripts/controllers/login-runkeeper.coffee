'use strict'

angular.module('fitspector')
  .controller 'RunKeeperLoginCtrl', ['$scope', '$http', '$routeParams', ($scope, $http, $routeParams) ->
    code = $routeParams.code
    config = {
      params: {
        code: code
      }
    }
    alert ('RunKeeper login code: ' + code)
    $http.get '/api/loginRK', config
  ]
