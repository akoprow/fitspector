'use strict'

class ImportStatusDirective
  constructor: ($firebase, $rootScope) ->
    return {
      replace: true
      restrict: 'E'
      templateUrl: 'views/directives/import-status.html'
      scope: {}
      link: ($scope) ->
        update = ->
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

        userRef = new Firebase("https://fitspector.firebaseio.com/users").child $rootScope.user.id
        importStatusRef = userRef.child 'importStatus'
        dbImportStatus = $firebase importStatusRef
        dbImportStatus.$on 'loaded', update
        dbImportStatus.$on 'change', update
    }

angular.module('fitspector').directive 'importStatus', ['$firebase', '$rootScope', ImportStatusDirective]
