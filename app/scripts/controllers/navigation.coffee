'use strict'

class NavigationCtrl
  @urls:
    workouts: '/workouts'
    leaderboard: '/leaderboard'

  constructor: ($location, $scope, LoginService) ->
    $scope.isAt = (id) ->
      return $location.path() == NavigationCtrl.urls[id]

    $scope.goTo = (id) ->
      $location.path(NavigationCtrl.urls[id])

    $scope.isLoggedIn = ->
      LoginService.getUser() != null

angular.module('fitspector').controller 'NavigationCtrl', ['$location', '$scope', 'LoginService', NavigationCtrl]
