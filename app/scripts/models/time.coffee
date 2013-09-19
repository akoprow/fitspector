'use strict'

root = exports ? this

HOURS_IN_A_DAY = 24

class root.Time
  constructor: (seconds) ->
    @t = moment.duration {seconds: seconds}

  # TODO(koper) Make some conventions/patterns for constructing objects from JSON
  @fromJson: (json) ->
    new Time(json)

  @plus: (t0, t1) ->
    new Time(t0.t.asSeconds() + t1.t.asSeconds())

  @zero:
    new Time(0)

  isZero: -> @t.asSeconds() == 0

  hours: -> @t.hours() + HOURS_IN_A_DAY * @t.days()
  minutes: -> @t.minutes()
