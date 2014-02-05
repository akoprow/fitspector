'use strict'

class WorkoutsProviderService

  constructor: ($rootScope, AuthService, DataProviderService) ->
    @workoutsListener = ->  # Callback to invoke when workouts change.
    @selectedWorkoutsListener = ->  # Callback to invoke when selected workouts change.
    @workoutFilter = (workout) -> true  # Selection filter for workouts.

    # Reset user workouts data.
    reset = =>
      @firstWorkout = moment()  # Oldest workout of the user.
      @workouts = []  # All synchronized workouts.
      @selectedWorkouts = []  # Workouts passing selection filter.
    reset()

    # Inform rest of the app that something has changed.
    updateViews = _.debounce (-> $rootScope.$digest()), 100

    # Called for every new workout added
    newWorkout = (dbWorkout) =>
      workout = new Workout(dbWorkout.val(), dbWorkout.name())
      @workouts.push workout
      @workoutsListener @workouts
      if @workoutsFilter workout
        @selectedWorkouts.push workout
        @selectedWorkoutsListener @selectedWorkouts
      @firstWorkout = workout.startTime if workout.startTime.isBefore @firstWorkout
      updateViews()

    # Loading data for a given user.
    changeUser = (user) =>
      # Remove all previous callbacks
      workoutsRef.off() if workoutsRef?

      if user.id?
        workoutsRef = DataProviderService.getFirebaseRoot().child('users').child(user.id).child('workouts')
        # sync workouts with DB data
        reset()
        workoutsRef.on 'child_added', newWorkout

    AuthService.registerUserChangeListener changeUser

    return {
      # Returns an object: {beg: moment, end: moment} defining the time range of user's workouts.
      getWorkoutsTimeRange: =>
        return {
          beg: @firstWorkout
          end: moment()
        }

      # Return the list of all workouts.
      getAllWorkouts: => @workouts

      # Returns all selected workout (i.e. ones passing the registered filter).
      getSelectedWorkouts: => @selectedWorkouts

      # Sets a filter for selection of workouts.
      setWorkoutsFilter: (@workoutsFilter) =>
         @selectedWorkouts = _(@workouts).filter @workoutsFilter
         @selectedWorkoutsListener @selectedWorkouts
    }

angular.module('fitspector').service 'WorkoutsProviderService', ['$rootScope', 'AuthService', 'DataProviderService', WorkoutsProviderService]
