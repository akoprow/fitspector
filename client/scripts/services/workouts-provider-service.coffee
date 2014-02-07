'use strict'

class WorkoutsProviderService

  constructor: ($rootScope, AuthService, DataProviderService) ->
    # Inform rest of the app that something has changed.
    notifyUpdate = _.debounce (-> $rootScope.$broadcast 'workouts.update'), 100

    # Reset user workouts data.
    reset = =>
      @firstWorkout = moment()  # Oldest workout of the user.
      @workouts = []  # All synchronized workouts.
      notifyUpdate()
    reset()

    # Called for every new workout added
    newWorkout = (dbWorkout) =>
      workout = new Workout(dbWorkout.val(), dbWorkout.name())
      @workouts.push workout
      @firstWorkout = workout.startTime if workout.startTime.isBefore @firstWorkout
      notifyUpdate()

    # Loading data for a given user.
    changeUser = (user) =>
      # Remove all previous callbacks
      workoutsRef.off() if workoutsRef?

      if user.id?
        workoutsRef = DataProviderService.getFirebaseRoot().child('users').child(user.id).child('workouts')
        # sync workouts with DB data
        reset()
        workoutsRef.on 'child_added', newWorkout

    # TODO(koper) This should be done by watchers instead...
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
    }

angular.module('fitspector').service 'WorkoutsProviderService', ['$rootScope', 'AuthService', 'DataProviderService', WorkoutsProviderService]
