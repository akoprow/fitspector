'use strict'

angular.module('fitspector', [
  'ngAnimate'
  'ngCookies'
  'ngRoute'
  'firebase'
]).run ->
  $(".alert").alert()
