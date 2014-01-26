(function() {
  'use strict';
  var moment, root;

  moment = typeof window !== "undefined" && window !== null ? window.moment : require('moment');

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Time = (function() {
    function Time(args) {
      this.t = moment.duration(args);
    }

    Time.plus = function(t0, t1) {
      return new Time({
        seconds: t0.t.asSeconds() + t1.t.asSeconds()
      });
    };

    Time.zero = new Time({
      seconds: 0
    });

    Time.ratio = function(t0, t1) {
      return t0.asSeconds() / t1.asSeconds();
    };

    Time.fraction = function(t0, f) {
      return new Time({
        seconds: t0.t.asSeconds() * f
      });
    };

    Time.prototype.isZero = function() {
      return this.t.asSeconds() === 0;
    };

    Time.prototype.hours = function() {
      return this.t.hours() + Time.HOURS_IN_A_DAY * this.t.days();
    };

    Time.prototype.minutes = function() {
      return this.t.minutes();
    };

    Time.prototype.seconds = function() {
      return this.t.seconds();
    };

    Time.prototype.asSeconds = function() {
      return this.t.asSeconds();
    };

    Time.prototype.asHours = function() {
      return this.t.asHours();
    };

    Time.prototype.subtract = function(t) {
      return new Time({
        seconds: this.asSeconds() - t.asSeconds()
      });
    };

    Time.prototype.value = function() {
      return this.asSeconds();
    };

    Time.prototype.serialize = function() {
      return this.value().toFixed(0);
    };

    Time.deserialize = function(value) {
      return new Time({
        seconds: value
      });
    };

    Time.SECONDS_IN_AN_HOUR = 60 * 60;

    Time.HOURS_IN_A_DAY = 24;

    return Time;

  })();

}).call(this);
