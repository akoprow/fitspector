'use strict'

root = exports ? this

class root.Pace
  constructor: (args) ->
    {time, distance} = args
    h = time.asHours()
    km = distance.asKilometers()
    # kmph = km/h
    @kmph = km / h

  asTimePerKm: ->
    new Time {seconds: Time.SECONDS_IN_AN_HOUR / @kmph}

  asKmPerHour: ->
    @kmph
