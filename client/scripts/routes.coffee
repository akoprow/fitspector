'use strict'

class Routes
  constructor: ($locationProvider, $routeProvider, $httpProvider) ->
    $locationProvider.html5Mode true

    $routeProvider
      .when '/login',
        templateUrl: 'views/login.html'
        controller: 'LoginCtrl'

      .when '/loginFailed',
        templateUrl: 'views/loginFailed.html'

      .when '/settings',
        templateUrl: 'views/settings.html'
        controller: 'SettingsCtrl'

      .when '/workouts',
        templateUrl: 'views/workouts.html'
        controller: 'WorkoutsCtrl'
        restricted: true

      .when '/compare',
        templateUrl: 'views/compare.html'
        controller: 'CompareCtrl'
        restricted: true

      .when '/',
        templateUrl: 'views/home.html'
        
      .otherwise
        redirectTo: '/'

    requestLoginInterceptor = ['$location', '$q', ($location, $q) ->
      success = (response) -> response
      error = (response) ->
        $location.path '/login' if response.status == 401
        return $q.reject response
      return (promise) -> promise.then success, error
    ]

    $httpProvider.responseInterceptors.push requestLoginInterceptor

angular.module('fitspector').config ['$locationProvider', '$routeProvider', '$httpProvider', Routes]


angular.module('fitspector').run ['$rootScope', '$location', 'AuthService', ($rootScope, $location, AuthService) ->
  $rootScope.$on '$routeChangeStart', (event, next, current) ->
    $rootScope.error = null
    $location.path '/login' if next.restricted && !AuthService.isLoggedIn()
]