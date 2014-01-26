(function() {
  'use strict';
  var CompareCtrl;

  CompareCtrl = (function() {
    function CompareCtrl($http, $scope, angularFire) {
      var computeLeaderboard, generate, makePlayer, makePlayers, randomValues, ref, timeUnit, updateTime;
      $scope.playersDB = [];
      ref = new Firebase("https://fitspector.firebaseio.com/users");
      angularFire(ref, $scope, "playersDB");
      makePlayer = function(player) {
        var res;
        res = {
          name: player.name,
          img: player.smallImgUrl,
          me: player.me,
          total: Distance.zero,
          days: _.range(0, 7).map(function() {
            return Distance.zero;
          })
        };
        return res;
      };
      $scope.players = [];
      makePlayers = function(data) {
        return $scope.players = _(data).map(makePlayer);
      };
      $scope.$watch('playersDB', makePlayers, true);
      randomValues = [];
      generate = function() {
        return randomValues = _.range(0, 100).map(function() {
          return Math.random();
        });
      };
      $scope.competitionMode = 'distance';
      $scope.setCompetitionMode = function(mode) {
        return $scope.competitionMode = mode;
      };
      $scope.$watch('competitionMode', function(mode) {
        return $scope.leaderboardModeTitle = (function() {
          switch (mode) {
            case 'distance':
              return 'total workout distance';
            case 'time':
              return 'total workout time';
            case 'elevation':
              return 'total elevation gain';
            case 'intensity':
              return 'workout intensity';
          }
        })();
      });
      computeLeaderboard = function() {
        var daysInRange, leaderScore, leaderboard, mkPlayer, random, randomScore;
        if ($scope.players.length === 0) {
          return [];
        }
        daysInRange = (function() {
          switch ($scope.timeMode) {
            case 'week':
              return 7;
            case 'month':
              return 30;
            case 'year':
              return 365;
          }
        })();
        random = _(randomValues).map(function(r) {
          return r * daysInRange;
        });
        randomScore = (function() {
          switch ($scope.competitionMode) {
            case 'distance':
              return function(random) {
                return new Distance({
                  km: random * 10
                });
              };
            case 'time':
              return function(random) {
                return new Time({
                  hours: random
                });
              };
            case 'elevation':
              return function(random) {
                return new Distance({
                  meters: random * 300
                });
              };
            case 'intensity':
              return function(random) {
                return new Intensity(random * 40);
              };
            default:
              throw new Error("Unknown competition mode: " + $scope.competitionMode);
          }
        })();
        mkPlayer = function(player) {
          return _.extend({
            score: randomScore(random.pop())
          }, player);
        };
        leaderboard = _.chain($scope.players).map(mkPlayer).sortBy(function(player) {
          return -player.score.value();
        }).value();
        leaderScore = leaderboard[0].score;
        leaderboard = _(leaderboard).map(function(player) {
          return _.extend(player, {
            scoreToLeader: leaderScore.subtract(player.score)
          });
        });
        return $scope.leaderboard = leaderboard;
      };
      $scope.$watch('players', computeLeaderboard, true);
      $scope.$watch('competitionMode', function() {
        generate();
        return computeLeaderboard();
      });
      timeUnit = function() {
        switch ($scope.timeMode) {
          case 'year':
            return 'years';
          case 'month':
            return 'months';
          case 'week':
            return 'weeks';
        }
      };
      $scope.setTimeMode = function(newMode) {
        return $scope.timeMode = newMode;
      };
      $scope.goNow = function() {
        return $scope.timeStart = moment();
      };
      $scope.next = function() {
        return $scope.timeStart.add(timeUnit(), 1);
      };
      $scope.prev = function() {
        return $scope.timeStart.add(timeUnit(), -1);
      };
      $scope.setTimeMode('week');
      $scope.goNow();
      updateTime = function() {
        var timeEnd, weekEndString, weekStartString;
        $scope.timeStart.startOf($scope.timeMode);
        $scope.modeDesc = (function() {
          switch ($scope.timeMode) {
            case 'year':
              return $scope.timeStart.format('YYYY');
            case 'month':
              return $scope.timeStart.format('MMM YYYY');
            case 'week':
              return $scope.timeStart.format('W / gggg');
          }
        })();
        $scope.modeFullDesc = (function() {
          switch ($scope.timeMode) {
            case 'week':
              timeEnd = $scope.timeStart.clone().add('days', 6);
              weekStartString = $scope.timeStart.format('LL');
              weekEndString = timeEnd.format('LL');
              return "(" + weekStartString + " — " + weekEndString + ")";
            default:
              return "";
          }
        })();
        $scope.leaderboardTimeTitle = (function() {
          switch ($scope.timeMode) {
            case 'year':
              return "" + ($scope.timeStart.format('YYYY'));
            case 'month':
              return $scope.timeStart.format('MMMM YYYY');
            case 'week':
              return "week " + ($scope.timeStart.format('W / gggg'));
          }
        })();
        return $scope.modeFullDesc = $scope.timeMode === 'week' ? (timeEnd = $scope.timeStart.clone().add('days', 6), "" + ($scope.timeStart.format('LL')) + " — " + (timeEnd.format('LL'))) : '';
      };
      $scope.$watch('timeStart.valueOf()', function() {
        updateTime();
        generate();
        return computeLeaderboard();
      });
      $scope.$watch('timeMode', function() {
        updateTime();
        generate();
        return computeLeaderboard();
      });
    }

    return CompareCtrl;

  })();

  angular.module('fitspector').controller('CompareCtrl', ['$http', '$scope', 'angularFire', CompareCtrl]);

}).call(this);
