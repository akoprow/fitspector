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
          if dbImportStatus.done?
            $scope.importStatus =
              type: 'finished'
              done: dbImportStatus.done
          else
            $scope.importStatus =
              type: 'inprogress'
              imported: dbImportStatus.imported
              total: dbImportStatus.total
              importProgress: 100 * dbImportStatus.imported / dbImportStatus.total

        changeUser = (user) ->
          $scope.importStatus = {}
          importStatusRef.off() if importStatusRef?
          if user.guest then return

          importStatusRef = DataProviderService.getFirebaseRoot().child('users').child(user.id).child('importStatus')
          dbImportStatus = $firebase importStatusRef
          dbImportStatus.$on 'loaded', updateStatus
          dbImportStatus.$on 'change', updateStatus

        AuthService.registerUserChangeListener changeUser
    }

angular.module('fitspector').directive 'importStatus', ['$firebase', 'AuthService', 'DataProviderService', ImportStatusDirective]
