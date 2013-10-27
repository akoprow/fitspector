'use strict'

class CompareCtrl

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
        me: player.me
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

    # ------------ Competition modes ------------
    $scope.competitionMode = 'distance'

    $scope.setCompetitionMode = (mode) ->
      $scope.competitionMode = mode

    $scope.$watch 'competitionMode', (mode) ->
      $scope.leaderboardModeTitle =
        switch mode
          when 'distance' then 'total workout distance'
          when 'time' then 'total workout time'
          when 'elevation' then 'total elevation gain'
          when 'intensity' then 'workout intensity'

    # ------------ Scoreboard ------------
    computeLeaderboard = ->
      return [] if $scope.players.length == 0
      daysInRange =
        switch $scope.timeMode
          when 'week' then 7
          when 'month' then 30
          when 'year' then 365
      random = _(randomValues).map (r) -> r * daysInRange

      randomScore =
        switch $scope.competitionMode
          when 'distance' then (random) -> new Distance {km: random * 10}        # max daily 10 km
          when 'time' then (random) -> new Time {hours: random}                  # max daily 1h
          when 'elevation' then (random) -> new Distance {meters: random * 300}  # max daily 300m
          when 'intensity' then (random) -> new Intensity(random * 40)           # max daily 40 pts
          else throw new Error "Unknown competition mode: #{$scope.competitionMode}"

      mkPlayer = (player) -> _.extend {score: randomScore(random.pop())}, player

      leaderboard = _.chain($scope.players)
        .map(mkPlayer)
        .sortBy((player) -> -player.score.value())
        .value()

      leaderScore = leaderboard[0].score
      leaderboard = _(leaderboard).map (player) ->
        _.extend player, {scoreToLeader: leaderScore.subtract player.score}
      $scope.leaderboard = leaderboard

    $scope.$watch 'players', computeLeaderboard, true
    $scope.$watch 'competitionMode', ->
      generate()
      computeLeaderboard()

    # ----- Time navigation -----
    # TODO(koper) Extract this into a time-selection service/controller?
    # TODO(koper) This is duplicated between here and workouts controller; FIX FIX FIX.

    timeUnit = ->
      switch $scope.timeMode
        when 'year' then 'years'
        when 'month' then 'months'
        when 'week' then 'weeks'

    $scope.setTimeMode = (newMode) -> $scope.timeMode = newMode

    $scope.goNow = -> $scope.timeStart = moment()

    $scope.next = -> $scope.timeStart.add timeUnit(), 1

    $scope.prev = -> $scope.timeStart.add timeUnit(), -1

    $scope.setTimeMode 'week'
    $scope.goNow()

    updateTime = ->
      $scope.timeStart.startOf $scope.timeMode
      $scope.modeDesc =
        switch $scope.timeMode
          when 'year' then $scope.timeStart.format('YYYY')
          when 'month' then $scope.timeStart.format('MMM YYYY')
          when 'week' then $scope.timeStart.format('W / gggg')

      $scope.modeFullDesc =
        switch $scope.timeMode
          when 'week'
            timeEnd = $scope.timeStart.clone().add 'days', 6
            weekStartString = $scope.timeStart.format('LL')
            weekEndString = timeEnd.format('LL')
            "(#{weekStartString} — #{weekEndString})"
          else ""

      $scope.leaderboardTimeTitle =
        switch $scope.timeMode
          when 'year' then "#{$scope.timeStart.format('YYYY')}"
          when 'month' then $scope.timeStart.format('MMMM YYYY')
          when 'week' then "week #{$scope.timeStart.format('W / gggg')}"

      $scope.modeFullDesc =
        if $scope.timeMode == 'week'
          timeEnd = $scope.timeStart.clone().add 'days', 6
          "#{$scope.timeStart.format('LL')} — #{timeEnd.format('LL')}"
        else
          ''        

    $scope.$watch 'timeStart.valueOf()', ->
      updateTime()
      generate()
      computeLeaderboard()

    $scope.$watch 'timeMode', ->
      updateTime()
      generate()
      computeLeaderboard()


angular.module('fitspector').controller 'CompareCtrl', ['$http', '$scope', 'angularFire', CompareCtrl]
