'use strict'

# TODO(koper) This should go somewhere else...
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
  cli:
    name: 'Climbing'
  cur:
    name: 'Curling'
  div:
    name: 'Scuba diving'
  fen:
    name: 'Fencing'
  fbl:
    name: 'Football'
  fho:
    name: 'Field hockey'
  glf:
    name: 'Golf'
  gym:
    name: 'Gymnastics'
  hbl:
    name: 'Handball'
  hik:
    name: 'Hiking'
  hoc:
    name: 'Hockey'
  hrd:
    name: 'Horseback riding'
  isk:
    name: 'Ice-skating'
  row:
    name: 'Rowing'
  rsk:
    name: 'Roller skating'
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
  srk:
    name: 'Snorkeling'
  swi:
    name: 'Swimming'
  tbt:
    name: 'Table tennis'
  ten:
    name: 'Tennis'
  tkd:
    name: 'Taekwondo'
  xcs:
    name: 'Cross-country skiing'
  vlb:
    name: 'Volleyball'
  wsr:
    name: 'Wind surfing'
  wtr:
    name: 'Weight training'
  wre:
    name: 'Wrestling'
  yog:
    name: 'Yoga'



class DataService
  constructor: ($http) ->
    $http.get('/data/workouts.json')
    .success (data) =>
      processWorkout = (workout) ->
        # Turn starting date into a moment
        workout.startedAt = moment workout.startedAt
        # Normalize exerciseType id
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
