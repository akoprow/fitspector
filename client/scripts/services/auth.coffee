'use strict'

class AuthService
  constructor: ($cookieStore, @$http) ->
    # Restore user data from the cookie.
    @user = $cookieStore.get 'user'
    @user = null if @user?.guest
    $cookieStore.remove 'user'

  logout: (callback) ->
    (@$http.post '/logout').success =>
      @user = null
      callback()


angular.module('fitspector').service 'AuthService', ['$cookieStore', '$http', AuthService]
