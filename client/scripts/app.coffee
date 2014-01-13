'use strict'

angular.module('fitspector', [
  'ngAnimate'
  'ngCookies'
  'ngRoute'
  'firebase'
  'pasvaz.bindonce'
  'infinite-scroll'
]).run ->
  $(".alert").alert()
