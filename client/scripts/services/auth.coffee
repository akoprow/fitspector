'use strict'

class AuthService
  constructor: ($cookieStore) ->
    @user = $cookieStore.get 'user'
    $cookieStore.remove 'user'

  isUserLoggedIn: ->
    @user?


angular.module('fitspector').service 'AuthService', ['$cookieStore', AuthService]
