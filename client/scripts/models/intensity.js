(function() {
  'use strict';
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Intensity = (function() {
    function Intensity(points) {
      this.points = points;
    }

    Intensity.plus = function(i0, i1) {
      return new Intensity(i0.points + i1.points);
    };

    Intensity.subtract = function(i0, i1) {
      return new Intensity(i0.points - i1.points);
    };

    Intensity.zero = new Intensity(0);

    Intensity.prototype.isZero = function() {
      return this.points === 0;
    };

    Intensity.prototype.value = function() {
      return this.points;
    };

    Intensity.prototype.subtract = function(i) {
      return new Intensity(this.value() - i.value());
    };

    return Intensity;

  })();

}).call(this);
