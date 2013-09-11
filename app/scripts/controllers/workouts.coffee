'use strict'

class WorkoutsCtrl
  constructor: (DataService, $scope) ->
    $scope.allWorkouts = -> DataService.getAllWorkouts()

angular.module('fitspector').controller 'WorkoutsCtrl', ['DataService', '$scope', WorkoutsCtrl]
