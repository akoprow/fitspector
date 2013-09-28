'use strict'

class LoginService
  constructor: (@angularFire, @$rootScope) ->

  getUser: -> @$rootScope.user

  setUser: (userId) ->
    userRef = new Firebase("https://fitspector.firebaseio.com/users").child userId
    @angularFire userRef, @$rootScope, "user"

angular.module('fitspector').service 'LoginService', ['angularFire', '$rootScope', LoginService]
