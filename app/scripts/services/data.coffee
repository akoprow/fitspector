'use strict'

allWorkoutTypes =
  arc:
    name: 'Archery'
  bbl:
    name: 'Baseball'
  bdm:
    name: 'Badminton'
  bkb:
    name: 'Basketball'
  bth:
    name: 'Biathlon'
  bik:
    name: 'Cycling'
  bob:
    name: 'Bobsled'
  box:
    name: 'Boxing'
  cur:
    name: 'Curling'
  fen:
    name: 'Fencing'
  fbl:
    name: 'Football'
  fho:
    name: 'Field hockey'
  gym:
    name: 'Gymnastics'
  hbl:
    name: 'Handball'
  hoc:
    name: 'Hockey'
  hrd:
    name: 'Horseback riding'
  isk:
    name: 'Ice-skating'
  row:
    name: 'Rowing'
  run:
    name: 'Running'
  sai:
    name: 'Sailing'
  sho:
    name: 'Shooting'
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

  getSportName: (sportId) ->
    sportType = allWorkoutTypes[sportId]
    sportType.name if sportType

  getAllWorkouts: ->
    @data

angular.module('fitspector').service 'DataService', ['$http', DataService]
