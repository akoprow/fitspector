(function() {
  'use strict';
  var DataProviderService;

  DataProviderService = (function() {
    function DataProviderService() {
      var getFirebaseRoot;
      getFirebaseRoot = function() {
        return new Firebase('https://fitspector-dev.firebaseio.com/');
      };
      return {
        getFirebaseRoot: getFirebaseRoot,
        auth: function(authToken) {
          return getFirebaseRoot().auth(authToken, function(error) {
            if (error) {
              return console.log('Authentication error');
            }
          });
        },
        logout: function() {
          return getFirebaseRoot().unauth();
        }
      };
    }

    return DataProviderService;

  })();

  angular.module('fitspector').service('DataProviderService', [DataProviderService]);

}).call(this);
