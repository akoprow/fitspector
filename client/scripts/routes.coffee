'use strict'

class Routes
  constructor: ($locationProvider, $routeProvider) ->
    $locationProvider.html5Mode true
    $routeProvider
      .when '/login',
        templateUrl: 'views/login.html'
        controller: 'LoginCtrl'

      .when '/workouts',
        templateUrl: 'views/workouts.html'
        controller: 'WorkoutsCtrl'

      .when '/leaderboard',
        templateUrl: 'views/leaderboard.html'
        controller: 'LeaderboardCtrl'

      .when '/',
        templateUrl: 'views/main.html'
        
      .otherwise
        redirectTo: '/'

angular.module('fitspector').config ['$locationProvider', '$routeProvider', Routes]
