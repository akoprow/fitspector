'use strict'

angular.module('fitspector', [])
  .config ['$routeProvider', '$locationProvider', ($routeProvider, $locationProvider) ->
    $locationProvider.html5Mode true
    $routeProvider
      .when '/login_rk',
        controller: 'RunKeeperLoginCtrl'
      .when '/',
        templateUrl: 'views/main.html'
        controller: 'MainCtrl'
      .otherwise
        redirectTo: '/'
  ]
