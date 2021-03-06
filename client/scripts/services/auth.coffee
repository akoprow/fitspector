'use strict'

class AuthService
  GUEST = { guest: true }
  userChangeListeners = []

  constructor: ($cookieStore, $http, $location, DataProviderService) ->
    userChangeListeners = []

    changeUser = (user) =>
      @user = user

      # Authenticate user against data storage.
      if !user.guest
        DataProviderService.auth user.token

      # Invoke all listeners for user change.
      _(userChangeListeners).each (listener) -> listener(user)

    # Restore user data from the cookie.
    changeUser ($cookieStore.get 'user') || GUEST
    $cookieStore.remove 'user'

    return {
      changeUser: changeUser

      registerUserChangeListener: (listener) =>
        userChangeListeners.push listener
        listener @user

      getUser: =>
        @user

      isLoggedIn: =>
        @user.name?

      logout: (callback) =>
        changeUser GUEST
        DataProviderService.logout()
        $location.path '/'
        ($http.post '/logout').success =>
          callback()
    }


angular.module('fitspector').service 'AuthService', ['$cookieStore', '$http', '$location', 'DataProviderService', AuthService]
