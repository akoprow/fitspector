'use strict'

class SettingsCtrl
  constructor: ($scope) ->
    $scope.tabs = [
      id: 'my-performance'
      title: 'My performance'
      url: '/views/settings/my-performance.html'
    ,
      id: 'display-preferences'
      title: 'Display preferences'
      url: '/views/settings/display-preferences.html'
    ]

    $scope.selectedTabId = $scope.tabs[0].id

    $scope.goTo = (tabId) ->
      $scope.selectedTabId = tabId


angular.module('fitspector').controller 'SettingsCtrl', ['$scope', SettingsCtrl]
