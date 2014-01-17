'use strict'

class MyPerformanceCtrl
  constructor: ($scope) ->
    $scope.settings =
      maxHR: 190

    $scope.hrZonesDummyMax = new Time { seconds: 5 }
    $scope.hrZonesDummyData = Zones.deserialize Time, [0, 1, 1, 1, 1, 1]

    # TODO(koper) This s fragile as it needs to be synchronized with values in server/exerciseZones.coffee
    $scope.intensity = ['Very light', 'Light', 'Moderate', 'Hard', 'Maximum']

    hrZoneBoundaries = [45, 35, 25, 15]

    $scope.getHrZoneRange = (i) ->
      if isNaN parseFloat($scope.settings.maxHR) then return ""

      getValue = (i) -> $scope.settings.maxHR - hrZoneBoundaries[i]
      switch i
        when 0 then "below #{getValue(0)}"
        when 4 then "above #{getValue(3)}"
        else "#{getValue(i-1) + 1} – #{getValue(i)}"


angular.module('fitspector').controller 'MyPerformanceCtrl', ['$scope', MyPerformanceCtrl]
