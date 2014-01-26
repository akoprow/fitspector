(function() {
  'use strict';
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Workout = (function() {
    function Workout(json, id) {
      var exerciseTypeId;
      this.id = id;
      this.startTime = moment(json.startTime);
      exerciseTypeId = json.exerciseType.toLowerCase();
      this.exerciseType = WorkoutType[exerciseTypeId];
      if (this.exerciseType == null) {
        throw new Error("Unknown exercise type: " + exerciseTypeId);
      }
      this.notes = json.notes;
      this.source = json.source;
      this.avgHR = json.avgHR;
      this.totalCalories = json.totalCalories;
      this.totalDistance = new Distance({
        meters: json.totalDistance
      });
      this.totalDuration = new Time({
        seconds: json.totalDuration
      });
      this.totalElevation = new Distance({
        meters: json.totalElevation
      });
      this.labels = json.labels;
      if (json.hrZones) {
        this.hrZones = Zones.deserialize(Time, json.hrZones);
      }
      if (json.paceZones) {
        this.paceZones = Zones.deserialize(Distance, json.paceZones);
      }
      if (json.elevationZones) {
        this.elevationZones = Zones.deserialize(Distance, json.elevationZones);
      }
      if (this.totalDistance.isZero()) {
        this.pace = null;
      } else {
        this.pace = new Pace({
          time: this.totalDuration,
          distance: this.totalDistance
        });
      }
      if (this.totalDistance.isZero() || this.totalElevation.isZero()) {
        this.steepness = null;
      } else {
        this.steepness = new Distance({
          meters: this.totalElevation.asMeters() / this.totalDistance.asKilometers()
        });
      }
    }

    Workout.prototype.detailsUrl = function() {
      if (this.source == null) {
        return null;
      } else if (this.source.hasOwnProperty('runKeeper')) {
        return this.source.runKeeper;
      } else {
        return null;
      }
    };

    return Workout;

  })();

}).call(this);
