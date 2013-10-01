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

    # ------------ Random numbers ------------
    randomValues = []
    generate = ->
      randomValues = _.range(0, 100).map( -> Math.random())
    generate()

    # ------------ Competition modes ------------
    $scope.competitionMode = 'distance'

    $scope.setCompetitionMode = (mode) ->
      generate()
      $scope.competitionMode = mode

    # ------------ Time segments ------------
#    $scope.getSegments = ->
#      switch $scope.timeMode
#    $scope.dayNames = _.range(0, 7).map (offset) -> moment(begDate).add('days', offset).format('ddd')

    # ------------ Scoreboard ------------
    computeLeaderboard = ->
      return [] if $scope.players.length == 0
      random = randomValues

      mkPlayer = (player) ->
        name: player.name
        img: player.img
        score: new Distance(random.pop() * 60000)

      leaderboard = _.chain($scope.players)
        .map(mkPlayer)
        .sortBy((player) -> -player.score.asKilometers())
        .value()

      leaderScore = leaderboard[0].score
      leaderboard = _(leaderboard).map (player) ->
        _.extend player, {scoreToLeader: Distance.subtract leaderScore, player.score}
      $scope.leaderboard = leaderboard

    $scope.$watch 'players', computeLeaderboard, true


angular.module('fitspector').controller 'LeaderboardCtrl', ['$http', '$scope', 'angularFire', LeaderboardCtrl]
