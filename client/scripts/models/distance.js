(function() {
  'use strict';
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Distance = (function() {
    function Distance(args) {
      switch (false) {
        case !args.hasOwnProperty('meters'):
          this.meters = args.meters || 0;
          break;
        case !args.hasOwnProperty('km'):
          this.meters = (args.km || 0) * Distance.METERS_IN_KILOMETER;
          break;
        default:
          throw new Error('Unknown unit when constructing an instance of Distance');
      }
      this.meters = Number(this.meters);
    }

    Distance.plus = function(d0, d1) {
      return new Distance({
        meters: d0.meters + d1.meters
      });
    };

    Distance.subtract = function(d0, d1) {
      return new Distance({
        meters: d0.meters - d1.meters
      });
    };

    Distance.zero = new Distance({
      meters: 0
    });

    Distance.ratio = function(t0, t1) {
      return t0.meters / t1.meters;
    };

    Distance.fraction = function(d0, f) {
      return new Distance({
        meters: d0.meters * f
      });
    };

    Distance.prototype.isZero = function() {
      return this.meters === 0;
    };

    Distance.prototype.asKilometers = function() {
      return this.meters / Distance.METERS_IN_KILOMETER;
    };

    Distance.prototype.asMeters = function() {
      return this.meters;
    };

    Distance.prototype.subtract = function(d) {
      return new Distance({
        meters: this.value() - d.value()
      });
    };

    Distance.prototype.value = function() {
      return this.asMeters();
    };

    Distance.prototype.serialize = function() {
      return this.meters.toFixed(0);
    };

    Distance.deserialize = function(value) {
      return new Distance({
        meters: value
      });
    };

    Distance.METERS_IN_KILOMETER = 1000;

    Distance.RACE_DISTANCE_5K = new Distance({
      km: 5
    });

    Distance.RACE_DISTANCE_10K = new Distance({
      km: 10
    });

    Distance.RACE_DISTANCE_HALF_MARATHON = new Distance({
      meters: 21098
    });

    Distance.RACE_DISTANCE_MARATHON = new Distance({
      meters: 42195
    });

    return Distance;

  })();

}).call(this);
