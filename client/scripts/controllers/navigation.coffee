'use strict'

class NavigationCtrl
  @urls:
    workouts: '/workouts'
    leaderboard: '/leaderboard'

  constructor: ($location, $scope, AuthService) ->
    $scope.isAt = (id) ->
      return $location.path() == NavigationCtrl.urls[id]

    $scope.goTo = (id) ->
      $location.path(NavigationCtrl.urls[id])

    $scope.getUser = ->
      AuthService.user

    $scope.logout = ->
      AuthService.logout ->
        $location.path '/'


angular.module('fitspector').controller 'NavigationCtrl', ['$location', '$scope', 'AuthService', NavigationCtrl]
