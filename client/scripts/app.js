(function() {
  'use strict';
  angular.module('fitspector', ['ngAnimate', 'ngCookies', 'ngRoute', 'firebase', 'pasvaz.bindonce', 'infinite-scroll']).run(function() {
    return $(".alert").alert();
  });

}).call(this);
