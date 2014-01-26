(function() {
  'use strict';
  var ImportStatusDirective;

  ImportStatusDirective = (function() {
    function ImportStatusDirective($firebase, AuthService, DataProviderService) {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'views/directives/import-status.html',
        scope: {},
        link: function($scope) {
          var changeUser, dbImportStatus, importStatusRef, updateStatus,
            _this = this;
          importStatusRef = null;
          dbImportStatus = null;
          updateStatus = function() {
            if (dbImportStatus == null) {
              return;
            }
            switch (false) {
              case dbImportStatus.done == null:
                return $scope.importStatus = {
                  type: 'finished',
                  done: dbImportStatus.done
                };
              case dbImportStatus.total == null:
                return $scope.importStatus = {
                  type: 'inprogress',
                  imported: dbImportStatus.imported,
                  total: dbImportStatus.total,
                  importProgress: 100 * dbImportStatus.imported / dbImportStatus.total
                };
              default:
                return $scope.importStatus = {
                  type: 'none'
                };
            }
          };
          changeUser = function(user) {
            $scope.importStatus = {};
            if (importStatusRef != null) {
              importStatusRef.off();
            }
            if (user.guest) {
              return;
            }
            importStatusRef = DataProviderService.getFirebaseRoot().child('users').child(user.id).child('importStatus');
            dbImportStatus = $firebase(importStatusRef);
            dbImportStatus.$on('loaded', updateStatus);
            return dbImportStatus.$on('change', updateStatus);
          };
          $scope.close = function() {
            if (importStatusRef != null) {
              return importStatusRef.remove();
            }
          };
          return AuthService.registerUserChangeListener(changeUser);
        }
      };
    }

    return ImportStatusDirective;

  })();

  angular.module('fitspector').directive('importStatus', ['$firebase', 'AuthService', 'DataProviderService', ImportStatusDirective]);

}).call(this);
