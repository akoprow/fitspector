'use strict'

root = exports ? this

class root.Intensity
  constructor: (@points) ->

  # TODO(koper) Derive many of those methods from conversions to/from numerical values.
  @plus: (i0, i1) ->
    new Intensity(i0.points + i1.points)

  @subtract: (i0, i1) ->
    new Intensity(i0.points - i1.points)

  @zero:
    new Intensity(0)

  isZero: -> @points == 0

  value: -> @points

  subtract: (i) ->
    new Intensity(@value() - i.value())
