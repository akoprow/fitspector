'use strict'

root = exports ? this

class root.UserSettings
  @defaultSettings = ->
    distance: "km"
    pace: "min/km"
    elevation: "meters"
    timeZone: "CET"
    weekStart: "mon"
    weight: "kg"
