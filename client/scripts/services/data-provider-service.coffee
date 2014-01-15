'use strict'


class DataProviderService

  constructor: ->
    getFirebaseRoot = -> new Firebase '/* @echo FIREBASE_ROOT */'

    return {
      getFirebaseRoot: getFirebaseRoot

      auth: (authToken) ->
        getFirebaseRoot().auth authToken, (error) ->
          if error
            # TODO(koper) Add proper error handling.
            console.log 'Authentication error'
    }


angular.module('fitspector').service 'DataProviderService', [DataProviderService]
