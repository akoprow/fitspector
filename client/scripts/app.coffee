'use strict'

angular.module('fitspector', [
  'ngAnimate'
  'ngCookies'
  'ngRoute'
  'firebase'
  'pasvaz.bindonce'
]).run ->
  $(".alert").alert()
