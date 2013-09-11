'use strict'

class WorkoutsCtrl
  constructor: (DataService, $scope) ->
    $scope.data = -> DataService.getData()

angular.module('fitspector').controller 'WorkoutsCtrl', ['DataService', '$scope', WorkoutsCtrl]
