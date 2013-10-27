'use strict'

root = exports ? this

METERS_IN_KILOMETER = 1000

class root.Distance
  constructor: (args) ->
    switch
      when args.meters?
        @meters = args.meters
      when args.km?
        @meters = args.km * METERS_IN_KILOMETER
      else
        throw new Error 'Unknown unit when constructing an instance of Distance'

  @fromJson: (json) ->
    new Distance {meters: json}

  @plus: (d0, d1) ->
    new Distance {meters: d0.meters + d1.meters}

  @subtract: (d0, d1) ->
    new Distance {meters: d0.meters - d1.meters}

  @zero:
    new Distance {meters: 0}

  @ratio: (t0, t1) ->
    t0.meters / t1.meters

  isZero: -> @meters == 0

  asKilometers: -> @meters / METERS_IN_KILOMETER

  asMeters: -> @meters

  subtract: (d) ->
    new Distance {meters: @value() - d.value()}

  value: -> @asMeters()
