'use strict'

allWorkoutTypes =
  bbl:
    name: 'Baseball'
  bkb:
    name: 'Basketball'
  bth:
    name: 'Biathlon'
  bik:
    name: 'Cycling'
  bob:
    name: 'Bobsled'
  cur:
    name: 'Curling'
  fen:
    name: 'Fencing'
  fbl:
    name: 'Football'
  hoc:
    name: 'Hockey'
  isk:
    name: 'Ice-skating'
  row:
    name: 'Rowing'
  run:
    name: 'Running'
  sai:
    name: 'Sailing'
  ski:
    name: 'Skiing'
  sqs:
    name: 'Squash'
  swi:
    name: 'Swimming'
  ten:
    name: 'Tennis'
  tkd:
    name: 'Taekwondo'
  xcs:
    name: 'Cross-country skiing'
  vlb:
    name: 'Volleyball'
  wtr:
    name: 'Weight training'
  wre:
    name: 'Wrestling'

  yog:
    name: 'Yoga'
  hik:
    name: 'Hiking'



class DataService
  constructor: ($http) ->
    $http.get('/data/workouts.json')
    .success (data) =>
      processWorkout = (workout) ->
        workout.exerciseType = workout.exerciseType.toLowerCase()
      @data = data
      @data.forEach processWorkout

    @workoutType = allWorkoutTypes

  getAllWorkouts: ->
    @data

angular.module('fitspector').service 'DataService', ['$http', DataService]
