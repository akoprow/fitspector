'use strict'

root = exports ? this

class root.Distance
  constructor: (@meters) ->

  @fromJson: (json) ->
    new Distance(json)

  @plus: (d0, d1) ->
    new Time(d0.meters + d1.meters)

  @zero:
    new Distance(0)
