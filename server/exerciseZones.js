(function() {
  'use strict';
  var Distance, Time, User, Zones, computeElevationZones, computeHrZones, computePaceZones, computeRunningPaceZones, filters, logger, moment, numericalZoneClassifier, _;

  filters = require('filters');

  logger = require('./utils/logger');

  moment = require('moment');

  _ = require('underscore');

  Distance = require('../client/scripts/models/distance').Distance;

  Time = require('../client/scripts/models/time').Time;

  User = require('../client/scripts/models/user').User;

  Zones = require('../client/scripts/models/zones').Zones;

  numericalZoneClassifier = function(boundaries) {
    return function(num) {
      switch (false) {
        case !(num > boundaries[3]):
          return Zones.MAXIMUM_ZONE;
        case !(num > boundaries[2]):
          return Zones.HARD_ZONE;
        case !(num > boundaries[1]):
          return Zones.MODERATE_ZONE;
        case !(num > boundaries[0]):
          return Zones.LIGHT_ZONE;
        default:
          return Zones.VERY_LIGHT_ZONE;
      }
    };
  };

  computeHrZones = function(args) {
    var hr, hrSeries, hrZoneClassifier, i, processHrEntry, singleZone, timeSeries, zoneBoundaries, zones, _i, _len, _ref;
    singleZone = args.totalDuration != null ? Zones.mkUnknownZone(Time, new Time({
      seconds: args.totalDuration
    })) : void 0;
    if (!((_ref = args.hrData) != null ? _ref.length : void 0)) {
      return singleZone.serialize();
    }
    zoneBoundaries = args.user.getHrZoneBoundaries();
    if (zoneBoundaries == null) {
      return singleZone.serialize();
    }
    hrZoneClassifier = numericalZoneClassifier(zoneBoundaries);
    hrSeries = [];
    timeSeries = [];
    processHrEntry = function(time, entry) {
      timeSeries.push(new Time({
        seconds: entry.timestamp - time
      }));
      hrSeries.push(entry['heart_rate']);
      return entry.timestamp;
    };
    _.reduce(args.hrData, processHrEntry, 0);
    zones = new Zones(Time);
    for (i = _i = 0, _len = hrSeries.length; _i < _len; i = ++_i) {
      hr = hrSeries[i];
      zones.addToZone(hrZoneClassifier(hr), timeSeries[i]);
    }
    return zones.serialize();
  };

  computeRunningPaceZones = function(user, distanceData) {
    var distanceSeries, i, paceZoneBoundaries, paceZoneClassifier, processDistanceEntry, speed, speedSeries, zones, _i, _len;
    speedSeries = [];
    distanceSeries = [];
    processDistanceEntry = function(acc, entry) {
      var distanceDelta, speed, timeDelta;
      timeDelta = (entry.timestamp - acc.timestamp) / Time.SECONDS_IN_AN_HOUR;
      distanceDelta = (entry.distance - acc.distance) / Distance.METERS_IN_KILOMETER;
      speed = distanceDelta / timeDelta;
      speedSeries.push(speed);
      distanceSeries.push(new Distance({
        km: distanceDelta
      }));
      return entry;
    };
    _.reduce(distanceData, processDistanceEntry, {
      timestamp: 0,
      distance: 0
    });
    paceZoneBoundaries = user.getRunningPaceZoneBoundaries();
    if (paceZoneBoundaries == null) {
      return null;
    }
    paceZoneClassifier = numericalZoneClassifier(paceZoneBoundaries);
    speedSeries = filters.average(speedSeries, 5);
    zones = new Zones(Distance);
    for (i = _i = 0, _len = speedSeries.length; _i < _len; i = ++_i) {
      speed = speedSeries[i];
      zones.addToZone(paceZoneClassifier(speed), distanceSeries[i]);
    }
    return zones;
  };

  computePaceZones = function(args) {
    var zones, _ref;
    zones = ((_ref = args.distanceData) != null ? _ref.length : void 0) && args.exerciseType === 'run' ? computeRunningPaceZones(args.user, args.distanceData) : null;
    if (zones) {
      return zones.serialize();
    } else if (args.totalDistance) {
      return Zones.mkUnknownZone(Distance, new Distance({
        meters: args.totalDistance
      })).serialize();
    } else {
      return void 0;
    }
  };

  computeElevationZones = function(args) {
    var distance, distanceSeries, elevationChange, elevationSeries, elevationZoneClassifier, grade, i, processDistanceEntry, processElevationEntry, zones, _i, _len, _ref, _ref1;
    if (!((_ref = args.distanceData) != null ? _ref.length : void 0) || !((_ref1 = args.pathData) != null ? _ref1.length : void 0)) {
      return void 0;
    }
    distanceSeries = [];
    elevationSeries = [];
    processElevationEntry = function(acc, entry) {
      elevationSeries.push(entry.altitude - acc);
      return entry.altitude;
    };
    _.reduce(args.pathData, processElevationEntry, args.pathData[0].altitude);
    processDistanceEntry = function(acc, entry) {
      distanceSeries.push(entry.distance - acc);
      return entry.distance;
    };
    _.reduce(args.distanceData, processDistanceEntry, 0);
    if (distanceSeries.length !== elevationSeries.length) {
      logger.warn("Lengths of distance/elevation series do not match (distance: " + distanceSeries.length + ", elevation: " + elevationSeries.length);
      return void 0;
    }
    elevationZoneClassifier = numericalZoneClassifier(args.user.getElevationZoneBoundaries());
    zones = new Zones(Distance);
    for (i = _i = 0, _len = distanceSeries.length; _i < _len; i = ++_i) {
      distance = distanceSeries[i];
      elevationChange = elevationSeries[i];
      grade = 100 * elevationChange / distance;
      zones.addToZone(elevationZoneClassifier(grade), new Distance({
        meters: distance
      }));
    }
    return zones.serialize();
  };

  module.exports = {
    computeHrZones: computeHrZones,
    computePaceZones: computePaceZones,
    computeElevationZones: computeElevationZones
  };

}).call(this);
