(function() {
  'use strict';
  var Distance, ELEVATION_ZONE_BOUNDARIES, HR_ZONE_BOUNDARIES, RUNNING_PACE_ZONE_BOUNDARIES, SPEED_FACTOR_10K, SPEED_FACTOR_5K, SPEED_FACTOR_HALF_MARATHON, SPEED_FACTOR_MARATHON, Time, UserSettings, moment, root, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  UserSettings = typeof window !== "undefined" && window !== null ? UserSettings : require('./userSettings').UserSettings;

  Distance = typeof window !== "undefined" && window !== null ? Distance : require('./distance').Distance;

  Time = typeof window !== "undefined" && window !== null ? Distance : require('./time').Time;

  _ = typeof window !== "undefined" && window !== null ? window._ : require('underscore');

  moment = typeof window !== "undefined" && window !== null ? window.moment : require('moment');

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  ELEVATION_ZONE_BOUNDARIES = [-9, -3, 3, 9];

  HR_ZONE_BOUNDARIES = [45, 35, 25, 15];

  RUNNING_PACE_ZONE_BOUNDARIES = [78, 88, 95, 100];

  SPEED_FACTOR_5K = 1.0000;

  SPEED_FACTOR_10K = 1.0383;

  SPEED_FACTOR_HALF_MARATHON = 1.0971;

  SPEED_FACTOR_MARATHON = 1.1545;

  root.User = (function() {
    var _this = this;

    function User(json) {
      this.getRunningPaceZoneBoundaries = __bind(this.getRunningPaceZoneBoundaries, this);
      this.getElevationZoneBoundaries = __bind(this.getElevationZoneBoundaries, this);
      this.getHrZoneBoundaries = __bind(this.getHrZoneBoundaries, this);
      this.id = json.id;
      this.name = json.name;
      this.smallImgUrl = json.smallImgUrl;
      this.token = json.token;
      this.performance = json.performance;
    }

    User.jsonUserFromRunKeeperProfile = function(profile, userId) {
      var age, user;
      user = {
        id: userId,
        name: profile.name,
        isMale: profile.gender === 'M',
        smallImgUrl: profile['small_picture'] || profile['medium_picture'] || profile['normal_picture'] || '',
        settings: new UserSettings(),
        token: null,
        runKeeperProfile: profile
      };
      if (profile.birthday != null) {
        user.birthday = new Date(profile.birthday);
        age = moment().diff(moment(profile.birthday), 'years');
        user.performance = {
          maxHR: 220 - age
        };
      }
      return user;
    };

    User.computeFunctionalThresholdPace = function(bestRace) {
      var raceSpeed;
      raceSpeed = bestRace.distance.asKilometers() / bestRace.time.asHours();
      switch (bestRace.distance.asMeters()) {
        case Distance.RACE_DISTANCE_5K.asMeters():
          return raceSpeed;
        case Distance.RACE_DISTANCE_10K.asMeters():
          return raceSpeed * SPEED_FACTOR_10K;
        case Distance.RACE_DISTANCE_HALF_MARATHON.asMeters():
          return raceSpeed * SPEED_FACTOR_HALF_MARATHON;
        case Distance.RACE_DISTANCE_MARATHON.asMeters():
          return raceSpeed * SPEED_FACTOR_MARATHON;
        default:
          throw new Error("Unknown race distance of " + (bestRace.distance.asMeters()) + "m. ");
      }
    };

    User.prototype.getHrZoneBoundaries = function() {
      var maxHR, _ref;
      maxHR = (_ref = this.performance) != null ? _ref.maxHR : void 0;
      if (maxHR != null) {
        return _.map(HR_ZONE_BOUNDARIES, function(adjuster) {
          return maxHR - adjuster;
        });
      } else {
        return null;
      }
    };

    User.prototype.getElevationZoneBoundaries = function() {
      return ELEVATION_ZONE_BOUNDARIES;
    };

    User.prototype.getRunningPaceZoneBoundaries = function() {
      var ftp, runBestDistance, runBestTime, _ref, _ref1;
      runBestDistance = (_ref = this.performance) != null ? _ref.runBestDistance : void 0;
      runBestTime = (_ref1 = this.performance) != null ? _ref1.runBestTime : void 0;
      if ((runBestDistance != null) && (runBestTime != null)) {
        ftp = root.User.computeFunctionalThresholdPace({
          distance: new Distance({
            meters: runBestDistance
          }),
          time: new Time({
            seconds: runBestTime
          })
        });
        return _.map(RUNNING_PACE_ZONE_BOUNDARIES, function(multiplier) {
          return ftp * multiplier / 100;
        });
      } else {
        return null;
      }
    };

    return User;

  }).call(this);

}).call(this);
