'use strict'

class AuthService
  GUEST = { guest: true }

  constructor: ($cookieStore, @$rootScope, @$http) ->
    # Restore user data from the cookie.
    @changeUser ($cookieStore.get 'user') || GUEST
    $cookieStore.remove 'user'

  changeUser: (user) ->
    @$rootScope.user = user
    @$rootScope.$broadcast 'userChanged', user

  getUser: ->
    @$rootScope.user

  isLoggedIn: ->
    @getUser().name?

  logout: (callback) ->
    (@$http.post '/logout').success =>
      @changeUser GUEST
      callback()


angular.module('fitspector').service 'AuthService', ['$cookieStore', '$rootScope', '$http', AuthService]
