'use strict'

class NavigationCtrl
  @urls:
    workouts: '/workouts'

  constructor: ($location, $scope) ->
    $scope.isAt = (id) ->
      return $location.path() == NavigationCtrl.urls[id]

    $scope.goTo = (id) ->
      $location.path(NavigationCtrl.urls[id])

angular.module('fitspector').controller 'NavigationCtrl', ['$location', '$scope', NavigationCtrl]
