'use strict'

class MyPerformanceCtrl
  constructor: ($scope) ->
    $scope.settings =
      maxHR: 190

    $scope.hrZonesDummyMax = new Time { seconds: 5 }
    $scope.hrZonesDummyData = Zones.deserialize Time, [0, 1, 1, 1, 1, 1]

    $scope.paceZonesDummyMax = new Time { meters: 5 }
    $scope.paceZonesDummyData = Zones.deserialize Distance, [0, 1, 1, 1, 1, 1]

    # TODO(koper) This s fragile as it needs to be synchronized with values in server/exerciseZones.coffee
    $scope.intensity = ['Very light', 'Light', 'Moderate', 'Hard', 'Maximum']

    hrZoneBoundaries = [45, 35, 25, 15]

    $scope.getHrZoneRange = (i) ->
      if i > 3 || isNaN(parseFloat($scope.settings.maxHR)) then return ""
      return $scope.settings.maxHR - hrZoneBoundaries[i]


angular.module('fitspector').controller 'MyPerformanceCtrl', ['$scope', MyPerformanceCtrl]
