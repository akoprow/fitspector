'use strict'

class TimeFilter
  constructor: ->
    format = d3.time.format('%H:%M')
    return (date) -> format(new Date(date))

angular.module('fitspector').filter 'time', [TimeFilter]
