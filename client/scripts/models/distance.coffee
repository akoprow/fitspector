'use strict'

root = exports ? this

class root.Distance
  constructor: (args) ->
    switch
      when args.hasOwnProperty 'meters'
        @meters = args.meters || 0
      when args.hasOwnProperty 'km'
        @meters = (args.km || 0) * Distance.METERS_IN_KILOMETER
      else
        throw new Error 'Unknown unit when constructing an instance of Distance'
    @meters = Number(@meters)  # in case args had numerical-strings

  @plus: (d0, d1) ->
    new Distance {meters: d0.meters + d1.meters}

  @subtract: (d0, d1) ->
    new Distance {meters: d0.meters - d1.meters}

  @zero:
    new Distance {meters: 0}

  @ratio: (t0, t1) ->
    t0.meters / t1.meters

  @fraction: (d0, f) ->
    new Distance {meters: d0.meters * f}

  isZero: -> @meters == 0

  asKilometers: -> @meters / Distance.METERS_IN_KILOMETER

  asMeters: -> @meters

  subtract: (d) ->
    new Distance {meters: @value() - d.value()}

  value: -> @asMeters()

  serialize: -> @meters.toFixed(0)

  @deserialize: (value) ->
    new Distance {meters: value}

  @METERS_IN_KILOMETER = 1000
