(function() {
  'use strict';
  var AuthService;

  AuthService = (function() {
    var GUEST, userChangeListeners;

    GUEST = {
      guest: true
    };

    userChangeListeners = [];

    function AuthService($cookieStore, $http, $location, DataProviderService) {
      var changeUser,
        _this = this;
      userChangeListeners = [];
      changeUser = function(user) {
        _this.user = user;
        if (!user.guest) {
          DataProviderService.auth(user.token);
        }
        return _(userChangeListeners).each(function(listener) {
          return listener(user);
        });
      };
      changeUser(($cookieStore.get('user')) || GUEST);
      $cookieStore.remove('user');
      return {
        changeUser: changeUser,
        registerUserChangeListener: function(listener) {
          userChangeListeners.push(listener);
          return listener(_this.user);
        },
        getUser: function() {
          return _this.user;
        },
        isLoggedIn: function() {
          return _this.user.name != null;
        },
        logout: function(callback) {
          changeUser(GUEST);
          DataProviderService.logout();
          $location.path('/');
          return ($http.post('/logout')).success(function() {
            return callback();
          });
        }
      };
    }

    return AuthService;

  })();

  angular.module('fitspector').service('AuthService', ['$cookieStore', '$http', '$location', 'DataProviderService', AuthService]);

}).call(this);
