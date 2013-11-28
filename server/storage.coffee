####################################################################################################
# Interface to the Database.
#
# Author: Adam Koprowski
####################################################################################################
'use strict'

Firebase = require 'firebase'
logger = require './utils/logger'

####################################################################################################

FIREBASE_ROOT = 'https://fitspector.firebaseIO.com'

####################################################################################################

mkFirebaseRef = ->
  return new Firebase("#{FIREBASE_ROOT}")

mkUserRef = (userId) ->
  mkFirebaseRef().child('users').child(userId)

mkUserWorkoutsRef = (userId) ->
  (mkUserRef userId).child('workouts')

mkUserWorkoutRef = (userId, workoutId) ->
  (mkUserRef userId).child('workouts').child(workoutId)

mkUserProfileRef = (userId) ->
  (mkUserRef userId).child('profile')

mkUserSettingsRef = (userId) ->
  (mkUserRef userId).child('settings')

####################################################################################################

getAllUserWorkouts = (userId, done, error) ->
  success = (workouts) -> done workouts.val()
  failure = -> error()
  (mkUserWorkoutsRef userId).once 'value', success, failure

####################################################################################################

addWorkout = (userId, workoutId, workout) ->
  (mkUserWorkoutRef userId, workoutId).set workout

####################################################################################################

getUserProfile = (userId, done, error) ->
  success = (profile) -> done profile.val()
  failure = -> error()
  (mkUserProfileRef userId).once 'value', success, failure

####################################################################################################

logLogin = (userId) ->
  (mkUserProfileRef userId).update {lastLogin: new Date()}
####################################################################################################

getUserSettings = (userId, done, error) ->
  success = (settings) -> done settings.val()
  failure = -> error()
  (mkUserSettingsRef userId).once 'value', success, failure

####################################################################################################

updateUserProfile = (userId, profile) ->
  (mkUserProfileRef userId).update profile

####################################################################################################

module.exports =
  addWorkout: addWorkout
  getAllUserWorkouts: getAllUserWorkouts
  getUserProfile: getUserProfile
  logLogin: logLogin
  updateUserProfile: updateUserProfile
  getUserSettings: getUserSettings
