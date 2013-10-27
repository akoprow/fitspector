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

  constructor: (angularFireCollection, $rootScope) ->
    # Loading data for a given user
    loadUser = (user) =>
      # Make sure we disable updates on previous reference.
      @workoutsRef.off() if @workoutsRef
      if user.id?
        userRef = new Firebase("https://fitspector.firebaseio.com/users").child user.id
        @workoutsRef = userRef.child 'workouts'
        $rootScope.dbWorkouts = angularFireCollection @workoutsRef, (workouts) =>
          $rootScope.dbWorkouts = workouts.val()

    # load current user
    loadUser $rootScope.user if $rootScope.user?

    # re-load data on user change
    $rootScope.$watch 'user', (user) => loadUser user

    # sync workouts with DB data
    $rootScope.$watch 'dbWorkouts', (dbWorkouts) =>
      $rootScope.allWorkouts = _(dbWorkouts).map (json) -> new Workout json

    @workoutType = allWorkoutTypes


  getSportName: (sportId) ->
    sportType = allWorkoutTypes[sportId]
    sportType.name if sportType


angular.module('fitspector').service 'DataService', ['angularFireCollection', '$rootScope', DataService]
