'use strict'


class DataProviderService

  constructor: ->
    return {
      getFirebaseRoot: -> new Firebase('/* @echo FIREBASE_ROOT */');
    }


angular.module('fitspector').service 'DataProviderService', [DataProviderService]
