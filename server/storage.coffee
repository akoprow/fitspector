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
  (mkUserRef userId).child 'workouts'

mkUserWorkoutRef = (userId, workoutId) ->
  (mkUserWorkoutsRef userId).child workoutId

mkUserProfileRef = (userId) ->
  (mkUserRef userId).child 'profile'

mkUserSettingsRef = (userId) ->
  (mkUserRef userId).child 'settings'

mkUserImportStatusRef = (userId) ->
  (mkUserRef userId).child 'importStatus'

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

# Import status contains the subset of the following fields:
#   total: total number of items to be imported
#   imported: how many have been imported so far
#   done: how many new workouts have been imported
#
# Presence of the 'done' field indicates that the import is completed.
# During import ratio of imported/total indicates completion progress.

setImportCount = (userId, count, cb) ->
  status =
    total: count
    imported: 0
  (mkUserImportStatusRef userId).set status, cb

markImportItemComplete = (userId) ->
  (mkUserImportStatusRef userId).child('imported').transaction (value) -> value + 1

importFinished = (userId, total) ->
  (mkUserImportStatusRef userId).set {done: total}

####################################################################################################

module.exports =
  addWorkout: addWorkout
  getAllUserWorkouts: getAllUserWorkouts
  getUserProfile: getUserProfile
  logLogin: logLogin
  updateUserProfile: updateUserProfile
  getUserSettings: getUserSettings

  setImportCount: setImportCount
  markImportItemComplete: markImportItemComplete
  importFinished: importFinished
