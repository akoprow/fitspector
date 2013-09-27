'use strict'

class LoginService
  constructor: ->

  getUser: -> @user

  setUser: (user) ->
    @user = user

angular.module('fitspector').service 'LoginService', [LoginService]
