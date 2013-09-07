'use strict'

angular.module('fitspector', [])
  .config ['$routeProvider', '$locationProvider', ($routeProvider, $locationProvider) ->
    $locationProvider.html5Mode true
    $routeProvider
      .when '/login_rk',
        templateUrl: 'views/login_rk.html'
        controller: 'RunKeeperLoginCtrl'
      .when '/',
        templateUrl: 'views/main.html'
        controller: 'MainCtrl'
      .otherwise
        redirectTo: '/'
  ]
