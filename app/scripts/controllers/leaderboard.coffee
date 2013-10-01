'use strict'

class LeaderboardCtrl

  constructor: ($http, $scope, angularFire) ->
    # ------------ DB connectivity ------------
    $scope.playersDB = []
    ref = new Firebase("https://fitspector.firebaseio.com/users");
    angularFire(ref, $scope, "playersDB");

    # Making a player instance from DB data
    makePlayer = (player) ->
      res =
        name: player.name
        img: player.smallImgUrl
        total: Distance.zero
        days: _.range(0, 7).map( -> Distance.zero)
        scoreDistance: new Distance(70 * 1000 * Math.random())
        
#      processWorkout = (workout) ->
#        distance = new Distance(workout.distance * 1000)
#        # TODO(koper) This needs to be address better.
#        day = (moment(workout.date).weekday() + 6) % 7
#        res.total = Distance.plus res.total, distance
#        res.days[day] = Distance.plus res.days[day], distance

#      _(player.workouts).each processWorkout

      return res

    # Watch for DB changes and reflect them on $scope.players
    $scope.players = []
    makePlayers = (data) ->
      $scope.players = _(data).map makePlayer

    $scope.$watch 'playersDB', makePlayers, true

    # ------------ Competition modes ------------
    $scope.competitionMode = 'distance'

    $scope.setCompetitionMode = (mode) ->
      $scope.competitionMode = mode

    # ------------ Time segments ------------
#    $scope.getSegments = ->
#      switch $scope.timeMode
#    $scope.dayNames = _.range(0, 7).map (offset) -> moment(begDate).add('days', offset).format('ddd')

    # ------------ Scoreboard ------------
    $scope.getPlayers = ->
      return [] if $scope.players.length == 0
      scoreboard = _.map $scope.players, (player) ->
        name: player.name
        img: player.img
        score: player.scoreDistance
      scoreboard = _(scoreboard).sortBy (player) -> -player.score.asKilometers()
      leaderScore = scoreboard[0].score
      _(scoreboard).map (player) ->
        _.extend player, {scoreToLeader: Distance.subtract leaderScore, player.score}


angular.module('fitspector').controller 'LeaderboardCtrl', ['$http', '$scope', 'angularFire', LeaderboardCtrl]
