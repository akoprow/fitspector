'use strict'

root = exports ? this

class root.Pace
  constructor: (args) ->
    {time, distance} = args
    sec = time.asSeconds()
    km = distance.asKilometers()
    # tpkm = time-per-kilometer
    @tpkm = new Time {seconds: sec / km}

  asTimePerKm: -> @tpkm
