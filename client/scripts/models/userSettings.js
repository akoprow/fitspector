(function() {
  'use strict';
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.UserSettings = (function() {
    function UserSettings() {
      this.distance = 'km';
      this.pace = 'min/km';
      this.elevation = 'meters';
      this.timeZone = 'CET';
      this.weekStart = 0;
      this.weight = 'kg';
    }

    return UserSettings;

  })();

}).call(this);
