'use strict'

class MatchCtrl
  constructor: ($scope) ->
    # Generic parametization
    dateFormat = 'YYYY-MM-DD HH:mm'
    speed = 50000

    # Instance parametrization
    start = moment '2013-09-16'
    end = moment '2013-09-23'

    # Let's do it...
    startMs = start.valueOf()

    tick = (elapsed) ->
      now = moment (startMs + speed * elapsed)

      finished = false
      if now.isAfter end
        finished = true
        now = end

      $scope.$apply ( ->
        $scope.time = now.format dateFormat
      )
      return finished

    $scope.start = ->
      d3.timer tick

angular.module('fitspector').controller 'MatchCtrl', ['$scope', MatchCtrl]
