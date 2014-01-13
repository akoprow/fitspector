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



class WorkoutsProviderService

  constructor: (AuthService, DataProviderService) ->
    @workoutsListener = ->  # Callback to invoke when workouts change.
    @selectedWorkoutsListener = ->  # Callback to invoke when selected workouts change.
    @workoutFilter = (workout) -> true  # Selection filter for workouts.

    @workoutType = allWorkoutTypes

    # Reset user workouts data.
    reset = =>
      @firstWorkout = moment()  # Oldest workout of the user.
      @workouts = []  # All synchronized workouts.
      @selectedWorkouts = []  # Workouts passing selection filter.
    reset()

    # Loading data for a given user.
    changeUser = (user) =>
      # Remove all previous callbacks
      workoutsRef.off() if workoutsRef?

      if user.id?
        workoutsRef = DataProviderService.getFirebaseRoot().child('users').child(user.id).child('workouts')

        # sync workouts with DB data
        reset()
        workoutsRef.on 'child_added', (dbWorkout) =>
          workout = new Workout(dbWorkout.val(), dbWorkout.name())
          @workouts.push workout
          @workoutsListener @workouts
          if @workoutsFilter workout
            @selectedWorkouts.push workout
            @selectedWorkoutsListener @selectedWorkouts
          # console.log "Added workout: #{dbWorkout.name()}, total workouts: #{@workouts.length}, selected: #{@selectedWorkouts.length}"
          @firstWorkout = workout.startTime if workout.startTime.isBefore @firstWorkout
    AuthService.registerUserChangeListener changeUser

    return {
      # Returns an object: {beg: moment, end: moment} defining the time range of user's workouts.
      getWorkoutsTimeRange: =>
        return {
          beg: @firstWorkout
          end: moment()
        }

      # Returns all selected workout (i.e. ones passing the registered filter).
      getSelectedWorkouts: => @selectedWorkouts

      # Registers a callback invoked whenever the list of workouts changes.
      setWorkoutsListener: (@workoutsListener) =>

      # Registers a callback invoked whenever the list of *selected* workouts changes.
      setSelectedWorkoutsListener: (@selectedWorkoutsListener) =>

      # Sets a filter for selection of workouts.
      setWorkoutsFilter: (@workoutsFilter) =>
         @selectedWorkouts = _(@workouts).filter @workoutsFilter
         @selectedWorkoutsListener @selectedWorkouts

      # TODO(koper) This should be moved somewhere else...
      getSportName: (sportId) =>
        sportType = allWorkoutTypes[sportId]
        sportType.name if sportType

    }

angular.module('fitspector').service 'WorkoutsProviderService', ['AuthService', 'DataProviderService', WorkoutsProviderService]
