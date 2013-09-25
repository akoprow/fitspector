'use strict'

class LeaderboardCtrl
  constructor: ($http, $scope) ->
    $http.get('/data/players.json')
    .success (data) =>
      $scope.players = data


angular.module('fitspector').controller 'LeaderboardCtrl', ['$http', '$scope', LeaderboardCtrl]
