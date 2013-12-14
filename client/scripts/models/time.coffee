'use strict'

# TODO(koper) Find a more fool-proof way to share code between the server and the browser.
moment = if window? then window.moment else require 'moment'

root = exports ? this

HOURS_IN_A_DAY = 24

class root.Time
  constructor: (args) ->
    @t = moment.duration args

  @plus: (t0, t1) ->
    new Time {seconds: t0.t.asSeconds() + t1.t.asSeconds()}

  @zero:
    new Time {seconds: 0}

  @ratio: (t0, t1) ->
    t0.asSeconds() / t1.asSeconds()

  @fraction: (t0, f) ->
    new Time {seconds: t0.t.asSeconds() * f}

  isZero: -> @t.asSeconds() == 0

  hours: -> @t.hours() + HOURS_IN_A_DAY * @t.days()
  minutes: -> @t.minutes()
  seconds: -> @t.seconds()

  asSeconds: -> @t.asSeconds()

  subtract: (t) ->
    new Time {seconds: @asSeconds() - t.asSeconds()}

  value: -> @asSeconds()

  serialize: -> @value().toFixed(0)

  @deserialize: (value) ->
    new Time {seconds: value}
