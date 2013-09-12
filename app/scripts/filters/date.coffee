'use strict'

class DateFilter
  constructor: ->
    format = d3.time.format('%Y-%m-%d')
    return (date) -> format(new Date(date))

angular.module('fitspector').filter 'fdate', [DateFilter]
