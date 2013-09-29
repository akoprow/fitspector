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
  constructor: (angularFire, $rootScope) ->
    $rootScope.$watch 'userId', (userId) =>
      if userId?
        # Make sure we disable updates on previous reference.
        @workoutsRef.off() if @workoutsRef
        userRef = new Firebase("https://fitspector.firebaseio.com/users").child userId
        @workoutsRef = userRef.child 'workouts'
        angularFire @workoutsRef, $rootScope, 'dbWorkouts'

    $rootScope.$watch 'dbWorkouts', (dbWorkouts) =>
      $rootScope.workouts = _(dbWorkouts).map Workout.fromJson

    @workoutType = allWorkoutTypes

  getSportName: (sportId) ->
    sportType = allWorkoutTypes[sportId]
    sportType.name if sportType


angular.module('fitspector').service 'DataService', ['angularFire', '$rootScope', DataService]
