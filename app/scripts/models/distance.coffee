'use strict'

root = exports ? this

METERS_IN_KILOMETER = 1000

class root.Distance
  constructor: (@meters) ->

  @fromJson: (json) ->
    new Distance(json)

  @plus: (d0, d1) ->
    new Distance(d0.meters + d1.meters)

  @zero:
    new Distance(0)

  isZero: -> @meters == 0

  kilometers: -> @meters / METERS_IN_KILOMETER
