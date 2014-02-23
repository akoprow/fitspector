'use strict'

class AnalyzeCtrl
  constructor: (WorkoutsProviderService, $scope) ->
    $scope.valueModes = [
      id: 'duration'
      desc: 'Duration'
    ,
      id: 'distance'
      desc: 'Distance'
    ,
      id: 'elevation'
      desc: 'Elevation'
    ]

    $scope.valueMode = $scope.valueModes[1]
    $scope.setValueMode = (mode) -> $scope.valueMode = mode


angular.module('fitspector').controller 'AnalyzeCtrl', ['WorkoutsProviderService', '$scope', AnalyzeCtrl]
