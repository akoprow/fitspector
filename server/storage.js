(function() {
  'use strict';
  var FIREBASE_ROOT, FIREBASE_SECRET, Firebase, FirebaseTokenGenerator, addWorkout, adminToken, canCreateUser, generateFirebaseToken, getAllUserWorkouts, getUserProfile, getUserSettings, importFinished, logLogin, logger, markImportItemComplete, mkFirebaseRef, mkUserImportStatusRef, mkUserProfileRef, mkUserRef, mkUserSettingsRef, mkUserWorkoutRef, mkUserWorkoutsRef, mkWhitelistedUsersRef, setImportCount, tokenGenerator, updateUserProfile;

  Firebase = require('firebase');

  FirebaseTokenGenerator = require('firebase-token-generator');

  logger = require('./utils/logger');

  FIREBASE_ROOT = process.env.FIREBASE_ROOT || (function() {
    throw new Error('Missing FIREBASE_ROOT');
  })();

  FIREBASE_SECRET = process.env.FIREBASE_SECRET || (function() {
    throw new Error('Missing FIREBASE_SECRET');
  })();

  mkFirebaseRef = function() {
    return new Firebase("" + FIREBASE_ROOT);
  };

  mkWhitelistedUsersRef = function(userId) {
    return mkFirebaseRef().child('whitelistedUsers').child(userId);
  };

  mkUserRef = function(userId) {
    return mkFirebaseRef().child('users').child(userId);
  };

  mkUserWorkoutsRef = function(userId) {
    return (mkUserRef(userId)).child('workouts');
  };

  mkUserWorkoutRef = function(userId, workoutId) {
    return (mkUserWorkoutsRef(userId)).child(workoutId);
  };

  mkUserProfileRef = function(userId) {
    return (mkUserRef(userId)).child('profile');
  };

  mkUserSettingsRef = function(userId) {
    return (mkUserRef(userId)).child('settings');
  };

  mkUserImportStatusRef = function(userId) {
    return (mkUserRef(userId)).child('importStatus');
  };

  getAllUserWorkouts = function(userId, done, error) {
    var failure, success;
    success = function(workouts) {
      return done(workouts.val());
    };
    failure = function() {
      return error();
    };
    return (mkUserWorkoutsRef(userId)).once('value', success, failure);
  };

  addWorkout = function(userId, workoutId, workout) {
    return (mkUserWorkoutRef(userId, workoutId)).set(workout);
  };

  getUserProfile = function(userId, done, error) {
    var failure, success;
    success = function(profile) {
      return done(profile.val());
    };
    failure = function() {
      return error();
    };
    return (mkUserProfileRef(userId)).once('value', success, failure);
  };

  logLogin = function(userId) {
    return (mkUserProfileRef(userId)).update({
      lastLogin: new Date()
    });
  };

  getUserSettings = function(userId, done, error) {
    var failure, success;
    success = function(settings) {
      return done(settings.val());
    };
    failure = function() {
      return error();
    };
    return (mkUserSettingsRef(userId)).once('value', success, failure);
  };

  updateUserProfile = function(userId, profile) {
    return (mkUserProfileRef(userId)).update(profile);
  };

  setImportCount = function(userId, count, cb) {
    var status;
    status = {
      total: count,
      imported: 0
    };
    return (mkUserImportStatusRef(userId)).set(status, cb);
  };

  markImportItemComplete = function(userId) {
    return (mkUserImportStatusRef(userId)).child('imported').transaction(function(value) {
      return value + 1;
    });
  };

  importFinished = function(userId, total) {
    return (mkUserImportStatusRef(userId)).set({
      done: total
    });
  };

  canCreateUser = function(userId, done, error) {
    var failure, success;
    success = function(user) {
      if (user.val()) {
        return done();
      } else {
        return error();
      }
    };
    failure = function() {
      logger.info('Login forbidden for: ', user);
      return error();
    };
    return (mkWhitelistedUsersRef(userId)).once('value', success, failure);
  };

  tokenGenerator = new FirebaseTokenGenerator(FIREBASE_SECRET);

  generateFirebaseToken = function(userId) {
    return tokenGenerator.createToken({
      userId: userId
    });
  };

  adminToken = tokenGenerator.createToken({}, {
    admin: true
  });

  mkFirebaseRef().auth(adminToken, function(error) {
    if (error) {
      logger.error("Failed authenticate the backend with Firebase, " + error);
      return process.exit(1);
    }
  });

  module.exports = {
    addWorkout: addWorkout,
    getAllUserWorkouts: getAllUserWorkouts,
    getUserProfile: getUserProfile,
    logLogin: logLogin,
    updateUserProfile: updateUserProfile,
    getUserSettings: getUserSettings,
    canCreateUser: canCreateUser,
    generateFirebaseToken: generateFirebaseToken,
    setImportCount: setImportCount,
    markImportItemComplete: markImportItemComplete,
    importFinished: importFinished
  };

}).call(this);
