'use strict'

class LeaderboardCtrl
  constructor: ($http, $scope) ->
    $http.get('/data/players.json')
    .success (data) =>
      reduceTraining = (total, training) -> Distance.plus total, new Distance(training.distance * 1000)
      $scope.players = _(data).map((player) ->
        name: player.name
        img: player.img
        total: _(player.trainings).reduce reduceTraining, Distance.zero
      )

    $scope.behindLeader = (player) ->
      Distance.subtract $scope.players[0].total, player.total


angular.module('fitspector').controller 'LeaderboardCtrl', ['$http', '$scope', LeaderboardCtrl]
