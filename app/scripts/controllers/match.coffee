'use strict'

class MatchCtrl
  constructor: ($scope) ->
    tick = (elapsed) ->
      $scope.$apply ( ->
        $scope.time = elapsed
      )
        
      return false

    $scope.start = ->
      d3.timer tick

angular.module('fitspector').controller 'MatchCtrl', ['$scope', MatchCtrl]
