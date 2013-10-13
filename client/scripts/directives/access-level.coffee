'use strict'

class AccessLevelDirective
  constructor: (AuthService) ->
    return {
      replace: true
      restrict: 'A'
      link: ($scope, element, attrs) ->
        originalDisplay = element.css 'display'
        accessLevel = attrs.accessLevel

        $scope.$watch 'AuthService.getUser()', (user) ->
          update()

        update = ->
          user = AuthService.getUser()
          visible =
            switch accessLevel
              when 'guest' then !user?
              when 'user' then user?
          element.css 'display', if visible then originalDisplay else 'none'
    }


angular.module('fitspector').directive 'accessLevel', ['AuthService', AccessLevelDirective]
