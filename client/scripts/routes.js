(function() {
  'use strict';
  var Routes;

  Routes = (function() {
    function Routes($locationProvider, $routeProvider, $httpProvider) {
      var requestLoginInterceptor;
      $locationProvider.html5Mode(true);
      $routeProvider.when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl'
      }).when('/loginFailed', {
        templateUrl: 'views/loginFailed.html'
      }).when('/workouts', {
        templateUrl: 'views/workouts.html',
        controller: 'WorkoutsCtrl',
        restricted: true
      }).when('/compare', {
        templateUrl: 'views/compare.html',
        controller: 'CompareCtrl',
        restricted: true
      }).when('/', {
        templateUrl: 'views/home.html'
      }).otherwise({
        redirectTo: '/'
      });
      requestLoginInterceptor = [
        '$location', '$q', function($location, $q) {
          var error, success;
          success = function(response) {
            return response;
          };
          error = function(response) {
            if (response.status === 401) {
              $location.path('/login');
            }
            return $q.reject(response);
          };
          return function(promise) {
            return promise.then(success, error);
          };
        }
      ];
      $httpProvider.responseInterceptors.push(requestLoginInterceptor);
    }

    return Routes;

  })();

  angular.module('fitspector').config(['$locationProvider', '$routeProvider', '$httpProvider', Routes]);

  angular.module('fitspector').run([
    '$rootScope', '$location', 'AuthService', function($rootScope, $location, AuthService) {
      return $rootScope.$on('$routeChangeStart', function(event, next, current) {
        $rootScope.error = null;
        if (next.restricted && !AuthService.isLoggedIn()) {
          return $location.path('/login');
        }
      });
    }
  ]);

}).call(this);
