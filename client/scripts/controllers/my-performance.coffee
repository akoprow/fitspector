'use strict'

class MyPerformanceCtrl
  constructor: ($scope) ->
    # ---------------------------------- Settings state management ---------------------------------
    master =
      maxHR: 190
      runBestDistance: 42195
      runBestTime: 3690

    # TODO(koper) This should be moved somewhere to utils...
    createEditable = (data) ->
      form =
        editMode: false
        value: data.getValue()

      edit = ->
        form.editMode = true

      cancel = ->
        form.value = data.getValue()
        form.editMode = false

      save = ->
        form.editMode = false
        data.saveValue form.value

      return {
        form: form
        edit: edit
        save: save
        cancel: cancel
      }

    $scope.intensity = ['Very light', 'Light', 'Moderate', 'Hard', 'Maximum']

    # ------------------------------------------ HR zones ------------------------------------------
    $scope.hrZonesDummyMax = new Time { seconds: 5 }
    $scope.hrZonesDummyData = Zones.deserialize Time, [0, 1, 1, 1, 1, 1]

    # TODO(koper) This s fragile as it needs to be synchronized with values in server/exerciseZones.coffee
    hrZoneBoundaries = [45, 35, 25, 15]

    $scope.hrMax = createEditable
      getValue: => master.maxHR
      saveValue: (formValue) => master.maxHR = formValue

    $scope.getHrZoneRange = (i) ->
      if i > 3 || isNaN(parseFloat($scope.hrMax.form.value)) then return ""
      return $scope.hrMax.form.value - hrZoneBoundaries[i]

    # ---------------------------------------- Running pace ----------------------------------------
    $scope.paceZonesDummyMax = new Time { meters: 5 }
    $scope.paceZonesDummyData = Zones.deserialize Distance, [0, 1, 1, 1, 1, 1]

    $scope.workoutTimePattern = /^[0-5]?\d:([0-5][0-9]:)?[0-5][0-9]$/

    $scope.runningEvents = [
      value: '5000'
      desc: '5 km'
    ,
      value: '10000'
      desc: '10 km'
    ,
      value: '21098'
      desc: 'half marathon'
    ,
      value: '42195'
      desc: 'marathon'
    ]

    secondsToString = (seconds) =>
      t = new Time {seconds: seconds}
      res = t.toString()
      console.log "secondsToString(#{seconds}) = #{res}"
      return res

    secondsFromString = (s) =>
      t = new Time(s)
      res = t.asSeconds()
      console.log "secondsFromString(#{s}) = #{res}"
      return res

    $scope.timeFromString = (s) =>
      new Time {seconds: secondsFromString s}

    $scope.runPerf = createEditable
      getValue: =>
        runBestDistance: master.runBestDistance
        runBestTime: secondsToString master.runBestTime
      saveValue: (formData) =>
        master.runBestDistance = formData.runBestDistance
        master.runBestTime = secondsFromString formData.runBestTime


angular.module('fitspector').controller 'MyPerformanceCtrl', ['$scope', MyPerformanceCtrl]
