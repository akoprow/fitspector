'use strict'

root = exports ? this

HOURS_IN_A_DAY = 24

class root.Time
  constructor: (args) ->
    @t = moment.duration args

  # TODO(koper) Make some conventions/patterns for constructing objects from JSON
  @fromJson: (json) ->
    new Time {seconds: json}

  @plus: (t0, t1) ->
    new Time {seconds: t0.t.asSeconds() + t1.t.asSeconds()}

  @zero:
    new Time {seconds: 0}

  @ratio: (t0, t1) ->
    t0.asSeconds() / t1.asSeconds()

  isZero: -> @t.asSeconds() == 0

  hours: -> @t.hours() + HOURS_IN_A_DAY * @t.days()
  minutes: -> @t.minutes()

  asSeconds: -> @t.asSeconds()

  subtract: (t) ->
    new Time {seconds: @asSeconds() - t.asSeconds()}

  value: -> @asSeconds()
