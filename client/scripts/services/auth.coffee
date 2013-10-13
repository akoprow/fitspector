'use strict'

class AuthService
  constructor: ($cookieStore) ->
    @user = $cookieStore.get 'user'
    $cookieStore.remove 'user'

  getUser: ->
    @user


angular.module('fitspector').service 'AuthService', ['$cookieStore', AuthService]
