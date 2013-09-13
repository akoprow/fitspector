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
    color: '#fa573c'
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
    color: '#d06b64'
  run:
    name: 'Running'
    color: '#b3dc6c'
  sai:
    name: 'Sailing'
  ski:
    name: 'Skiing'
  sqs:
    name: 'Squash'
    color: '#b99aff'
  swi:
    name: 'Swimming'
    color: '#ffad46'
  ten:
    name: 'Tennis'
    color: '#9fe1e7'
  tkd:
    name: 'Taekwondo'
  xcs:
    name: 'Cross-country skiing'
    color: '#cca6ac'
  vlb:
    name: 'Volleyball'
    color: '#f691b2'
  wtr:
    name: 'Weight training'
    color: '#9fc6e7'
  wre:
    name: 'Wrestling'

  yoga:
    name: 'Yoga'
    color: '#fad165'
  hik:
    name: 'Hiking'
    color: '#ac725e'



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
