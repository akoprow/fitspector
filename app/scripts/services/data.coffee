'use strict'

class DataService
  constructor: ($http) ->
    $http.get('/data/workouts.json')
    .success (data) =>
      @data = data

  getAllWorkouts: ->
    @data

angular.module('fitspector').service 'DataService', ['$http', DataService]
