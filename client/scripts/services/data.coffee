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

  constructor: ($firebase, $rootScope) ->
    # sync workouts with DB data
    processWorkouts = (dbWorkouts) =>
      $rootScope.allWorkouts = _(dbWorkouts).map (workout, key) -> new Workout(workout, key)

    # Loading data for a given user
    loadUser = (user) =>
      if user.id?
        userRef = new Firebase("https://fitspector.firebaseio.com/users").child user.id
        workoutsRef = userRef.child 'workouts'
        workouts = $firebase workoutsRef
        workouts.$on 'loaded', processWorkouts
        # workouts.$on 'change', processWorkouts

    # load current user
    loadUser $rootScope.user if $rootScope.user?

    # re-load data on user change
    $rootScope.$watch 'user', loadUser

    @workoutType = allWorkoutTypes


  getSportName: (sportId) ->
    sportType = allWorkoutTypes[sportId]
    sportType.name if sportType


angular.module('fitspector').service 'DataService', ['$firebase', '$rootScope', DataService]
