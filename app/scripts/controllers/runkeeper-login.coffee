'use strict'

angular.module('fitspector')
  .controller 'RunKeeperLoginCtrl', ['$scope', '$location', '$http', ($scope, $location, $http) ->
    config = {
      params: {
        code: $location.search 'code'
      }
    }
    $http.get '/api/loginRK', config
  ]
