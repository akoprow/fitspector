'use strict'

class AccessLevelDirective
  constructor: (AuthService) ->
    return {
      replace: true
      restrict: 'A'
      link: ($scope, element, attrs) ->
        originalDisplay = element.css 'display'
        accessLevel = attrs.accessLevel

        $scope.user = AuthService.user
        $scope.$watch 'user', (user) ->
          update()

        update = ->
          visible =
            switch accessLevel
              when 'guest' then !$scope.user?
              when 'user' then $scope.user?
          element.css 'display', if visible then originalDisplay else 'none'
    }


angular.module('fitspector').directive 'accessLevel', ['AuthService', AccessLevelDirective]
