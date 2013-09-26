'use strict'

class LeaderboardCtrl
  begDate = '2013-09-16'

  constructor: ($http, $scope) ->
    makePlayer = (player) ->
      res =
        name: player.name
        img: player.img
        total: Distance.zero
        days: _.range(0, 7).map( -> Distance.zero)

      processWorkout = (workout) ->
        distance = new Distance(workout.distance * 1000)
        # TODO(koper) This needs to be address better.
        day = (moment(workout.date).weekday() + 6) % 7
        res.total = Distance.plus res.total, distance
        res.days[day] = Distance.plus res.days[day], distance

      _(player.workouts).each processWorkout
      return res

    $http.get('/data/players.json')
    .success (data) =>
      $scope.players = _(data).map makePlayer
      $scope.players = _($scope.players).sortBy (player) -> -player.total.asKilometers()

    $scope.behindLeader = (player) ->
      Distance.subtract $scope.players[0].total, player.total

    $scope.dayNames = _.range(0, 7).map (offset) -> moment(begDate).add('days', offset).format('ddd')


angular.module('fitspector').controller 'LeaderboardCtrl', ['$http', '$scope', LeaderboardCtrl]
