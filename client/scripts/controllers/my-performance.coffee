'use strict'

class MyPerformanceCtrl
  constructor: ($scope) ->
    $scope.settings =
      maxHR: 190
      runBestDistance: ''
      runBestTime: ''

    $scope.intensity = ['Very light', 'Light', 'Moderate', 'Hard', 'Maximum']

    # ------------------------------------------ HR zones ------------------------------------------
    $scope.hrZonesDummyMax = new Time { seconds: 5 }
    $scope.hrZonesDummyData = Zones.deserialize Time, [0, 1, 1, 1, 1, 1]

    # TODO(koper) This s fragile as it needs to be synchronized with values in server/exerciseZones.coffee
    hrZoneBoundaries = [45, 35, 25, 15]

    $scope.getHrZoneRange = (i) ->
      if i > 3 || isNaN(parseFloat($scope.settings.maxHR)) then return ""
      return $scope.settings.maxHR - hrZoneBoundaries[i]

    # ---------------------------------------- Running pace ----------------------------------------
    $scope.paceZonesDummyMax = new Time { meters: 5 }
    $scope.paceZonesDummyData = Zones.deserialize Distance, [0, 1, 1, 1, 1, 1]

    $scope.workoutTimePattern = /^[0-5]?\d:([0-5][0-9]:)?[0-5][0-9]$/

    $scope.runningEvents = [
      value: '5000'
      desc: '5 km'
    ,
      value: '10000'
      desc: '10 km'
    ,
      value: '21098'
      desc: 'half marathon'
    ,
      value: '42195'
      desc: 'marathon'
    ]


angular.module('fitspector').controller 'MyPerformanceCtrl', ['$scope', MyPerformanceCtrl]
