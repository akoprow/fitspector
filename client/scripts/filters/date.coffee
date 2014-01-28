'use strict'

class DateFilter
  constructor: ->
    format = d3.time.format('%d/%M/%Y')
    return (date) -> format(new Date(date))

angular.module('fitspector').filter 'date', [DateFilter]
