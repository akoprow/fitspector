(function() {
  'use strict';
  var root, _;

  _ = typeof window !== "undefined" && window !== null ? window._ : require('underscore');

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Zones = (function() {
    function Zones(Unit) {
      this.Unit = Unit;
      this.zones = [];
    }

    Zones.mkUnknownZone = function(Unit, value) {
      var zones;
      zones = new Zones(Unit);
      zones.addToZone(Zones.UNKNOWN_ZONE, value);
      return zones;
    };

    Zones.prototype.zonePercent = function(i) {
      var allZones, percent, zone;
      if (!this.zones[i]) {
        return "0%";
      }
      zone = this.zones[i];
      allZones = this.getTotal();
      percent = 100 * this.Unit.ratio(zone, allZones);
      return "" + percent + "%";
    };

    Zones.prototype.gaugePercent = function(gaugeRange) {
      var ratio;
      ratio = this.Unit.ratio(this.getTotal(), gaugeRange);
      if (ratio > 1) {
        ratio = 1;
      }
      return "" + (100 * ratio) + "%";
    };

    Zones.prototype.gaugeMultiplicator = function(gaugeRange) {
      var ratio;
      ratio = this.Unit.ratio(this.getTotal(), gaugeRange);
      if (ratio >= 1.1) {
        return ratio.toFixed(1);
      } else {
        return null;
      }
    };

    Zones.prototype.getTotal = function() {
      if (!this.total) {
        this.total = _(this.zones).reduce(this.Unit.plus, this.Unit.zero);
      }
      return this.total;
    };

    Zones.prototype.addToZone = function(i, value) {
      var oldValue, _ref;
      if (i >= 0 && i <= 5) {
        oldValue = (_ref = this.zones[i]) != null ? _ref : this.Unit.zero;
        return this.zones[i] = this.Unit.plus(oldValue, value);
      }
    };

    Zones.prototype.serialize = function() {
      return _.map(this.zones, function(v) {
        return v.serialize();
      });
    };

    Zones.deserialize = function(Unit, json) {
      var deserializeZone, zones;
      zones = new Zones(Unit);
      deserializeZone = function(zone) {
        if (json[zone]) {
          return zones.addToZone(zone, Unit.deserialize(json[zone]));
        }
      };
      _(this.ALL_ZONES).each(deserializeZone);
      return zones;
    };

    Zones.UNKNOWN_ZONE = 0;

    Zones.VERY_LIGHT_ZONE = 1;

    Zones.LIGHT_ZONE = 2;

    Zones.MODERATE_ZONE = 3;

    Zones.HARD_ZONE = 4;

    Zones.MAXIMUM_ZONE = 5;

    Zones.ALL_ZONES = [Zones.UNKNOWN_ZONE, Zones.VERY_LIGHT_ZONE, Zones.LIGHT_ZONE, Zones.MODERATE_ZONE, Zones.HARD_ZONE, Zones.MAXIMUM_ZONE];

    Zones.STEEP_DOWNHILL = 1;

    Zones.DOWNHILL = 2;

    Zones.FLAT = 3;

    Zones.UPHILL = 4;

    Zones.STEEP_UPHILL = 5;

    return Zones;

  })();

}).call(this);
