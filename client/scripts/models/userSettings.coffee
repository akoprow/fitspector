'use strict'

root = exports ? this

class root.UserSettings
  constructor:  ->
    @distance: "km" #accepted values: "km", "mil"
    @pace: "min/km" #accepted values: "min/km", "min/mile", "km/h", "mph"
    @elevation: "meters" #accepted values: "meters", "feet"
    @timeZone: "CET" #accepted values: "EST CST ... MST PST" based on http://momentjs.com/docs/#/displaying/format/
    @weekStart: 0 #accepted values: 0, 1, ... 6 where 0 is monday 1 tuesday etc
    @weight: "kg" #accepted values: "kg", "pounds", "stones"
