'use strict'

root = exports ? this

class root.Workout
  constructor: (json, @id) ->
    @startTime = moment json.startTime
    # Normalize exerciseType id
    @exerciseType = json.exerciseType.toLowerCase()
    @notes = json.notes
    @source = json.source

    @totalCalories = json.totalCalories # TODO(koper) Create a type for calories
    @totalDistance = new Distance {meters: json.totalDistance}
    @totalDuration = new Time {seconds: json.totalDuration}
    @totalElevation = new Distance {meters: json.totalElevation}

    if not @totalDistance.isZero()
      @pace = new Pace
        time: @totalDuration,
        distance: @totalDistance

    if not @totalDistance.isZero() and not @totalElevation.isZero()
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
