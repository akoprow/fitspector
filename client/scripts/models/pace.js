(function() {
  'use strict';
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Pace = (function() {
    function Pace(args) {
      var distance, h, km, time;
      time = args.time, distance = args.distance;
      h = time.asHours();
      km = distance.asKilometers();
      this.kmph = km / h;
    }

    Pace.prototype.asTimePerKm = function() {
      return new Time({
        seconds: Time.SECONDS_IN_AN_HOUR / this.kmph
      });
    };

    Pace.prototype.asKmPerHour = function() {
      return this.kmph;
    };

    return Pace;

  })();

}).call(this);
