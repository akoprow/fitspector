'use strict'

class AccessLevelDirective
  constructor: (AuthService) ->
    return {
      replace: true
      restrict: 'A'
      link: ($scope, element, attrs) ->
        originalDisplay = element.css 'display'
        accessLevel = attrs.accessLevel

        changeUser = (user) ->
          visible =
            switch accessLevel
              # TODO(koper) This is fragile; find a better way to distinguish between different user classes.
              when 'guest' then !AuthService.isLoggedIn()
              when 'user' then AuthService.isLoggedIn()
          element.css 'display', if visible then originalDisplay else 'none'

        AuthService.registerUserChangeListener changeUser
    }


angular.module('fitspector').directive 'accessLevel', ['AuthService', AccessLevelDirective]
