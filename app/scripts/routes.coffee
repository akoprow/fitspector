'use strict'

class Routes
  constructor: ($locationProvider, $routeProvider) ->
    $locationProvider.html5Mode true
    $routeProvider
      .when '/login_rk',
        templateUrl: 'views/login_rk.html'
        controller: 'RunKeeperLoginCtrl'
      .when '/workouts',
        templateUrl: 'views/workouts.html'
        controller: 'WorkoutsCtrl'
      .when '/match',
        templateUrl: 'views/match.html'
      .when '/',
        templateUrl: 'views/main.html'
      .otherwise
        redirectTo: '/'

angular.module('fitspector').config ['$locationProvider', '$routeProvider', Routes]
