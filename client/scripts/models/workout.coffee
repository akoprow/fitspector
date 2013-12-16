'use strict'

root = exports ? this

class root.Workout
  constructor: (json, @id) ->
    @startTime = moment json.startTime
    # Normalize exerciseType id
    @exerciseType = json.exerciseType.toLowerCase()
    @notes = json.notes
    @source = json.source

    @avgHR = json.avgHR
    @totalCalories = json.totalCalories # TODO(koper) Create a type for calories
    @totalDistance = new Distance {meters: json.totalDistance}
    @totalDuration = new Time {seconds: json.totalDuration}
    @totalElevation = new Distance {meters: json.totalElevation}
    @labels = json.labels

    @hrZones = Zones.deserialize Time, json.hrZones if json.hrZones
    @paceZones = Zones.deserialize Distance, json.paceZones if json.paceZones

    if @totalDistance.isZero()
      @pace = null
    else
      @pace = new Pace
        time: @totalDuration,
        distance: @totalDistance

    if @totalDistance.isZero() || @totalElevation.isZero()
      @steepness = null
    else
      # Steepness in meters/km
      @steepness = new Distance
        meters: @totalElevation.asMeters() / @totalDistance.asKilometers()


  detailsUrl: ->
    if not @source?
      null
    else if @source.hasOwnProperty 'runKeeper'
      @source.runKeeper
    else
      null
