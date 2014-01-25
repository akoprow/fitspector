'use strict'

class ImportStatusDirective
  constructor: ($firebase, AuthService, DataProviderService) ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/import-status.html'
      scope: {}
      link: ($scope) ->
        importStatusRef = null
        dbImportStatus = null

        updateStatus = ->
          return if !dbImportStatus?
          switch
            when dbImportStatus.done?
              $scope.importStatus =
                type: 'finished'
                done: dbImportStatus.done
            when dbImportStatus.total?
              $scope.importStatus =
                type: 'inprogress'
                imported: dbImportStatus.imported
                total: dbImportStatus.total
                importProgress: 100 * dbImportStatus.imported / dbImportStatus.total
            else
              $scope.importStatus =
                type: 'none'

        changeUser = (user) =>
          $scope.importStatus = {}
          importStatusRef.off() if importStatusRef?
          if user.guest then return

          importStatusRef = DataProviderService.getFirebaseRoot().child('users').child(user.id).child('importStatus')
          dbImportStatus = $firebase importStatusRef
          dbImportStatus.$on 'loaded', updateStatus
          dbImportStatus.$on 'change', updateStatus

        $scope.close = =>
          importStatusRef.remove() if importStatusRef?

        # TODO(koper) This should be changed to the way workouts info is propagated.
        AuthService.registerUserChangeListener changeUser
    }

angular.module('fitspector').directive 'importStatus', ['$firebase', 'AuthService', 'DataProviderService', ImportStatusDirective]
