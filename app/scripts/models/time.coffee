'use strict'

root = exports ? this

class root.Time
  constructor: (@seconds) ->

  # TODO(koper) Make some conventions/patterns for constructing objects from JSON
  @fromJson: (json) ->
    new Time(json)

  @plus: (t0, t1) ->
    new Time(t0.seconds + t1.seconds)

  @zero:
    new Time(0)
