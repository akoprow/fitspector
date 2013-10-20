'use strict'

class AccessLevelDirective
  constructor: ($rootScope, AuthService) ->
    return {
      replace: true
      restrict: 'A'
      link: ($scope, element, attrs) ->
        originalDisplay = element.css 'display'
        accessLevel = attrs.accessLevel

        update = (user) ->
          visible =
            switch accessLevel
              # TODO(koper) This is fragile; find a better way to distinguish between different user classes.
              when 'guest' then user.guest
              when 'user' then user.name?
          element.css 'display', if visible then originalDisplay else 'none'

        $rootScope.$on 'userChanged', (e, user) -> update user
        update AuthService.getUser()
    }


angular.module('fitspector').directive 'accessLevel', ['$rootScope', 'AuthService', AccessLevelDirective]
