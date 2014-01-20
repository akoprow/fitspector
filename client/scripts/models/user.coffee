'use strict';

UserSettings = if window? then UserSettings else require('./userSettings').UserSettings
_ = if window? then window._ else require 'underscore'


root = exports ? this

# Boundaries for elevation zones, expressed as grade of the route.
ELEVATION_ZONE_BOUNDARIES = [-9, -3, 3, 9]

# TODO(koper) Should this be configurable?
# Based on the Zoladz method: http://en.wikipedia.org/wiki/Heart_rate
# Boundaries expressed as a difference from HRmax.
HR_ZONE_BOUNDARIES = [45, 35, 25, 15]

# Based on Friel's zones:
#   http://www.joefrielsblog.com/2010/05/quick-guide-to-training-with-heart-rate-power-and-pace.html
#
# Zone 1 Slower than 129% of FTPa
# Zone 2 114% to 129% of FTPa
# Zone 3 106% to 113% of FTPa
# Zone 4 101% to 105% of FTPa
# Zone 5a 97% to 100% of FTPa
# Zone 5b 90% to 96% of FTPa
# Zone 5c Faster than 90% of FTPa
#
# ZONE           maximum    hard     moderate    light   very light
# FTPa min/km     <100%   101-105%   106-113%   114-129%   >129%
# FTPa km/h       >100%      95%       88%        78%
#
# Boundaries expressed in % of FTP.
RUNNING_PACE_ZONE_BOUNDARIES = [78, 88, 95, 100]


class root.User
  constructor: (json) ->
    @id = json.id
    @name = json.name
    @smallImgUrl = json.smallImgUrl
    @token = json.token
    @performance = json.performance


  @jsonUserFromRunKeeperProfile: (profile, userId) ->
    id: userId
    name: profile.name
    isMale: profile.gender is 'M'
    birthday: new Date(profile.birthday)
    smallImgUrl: profile['small_picture'] || profile['medium_picture'] || profile['normal_picture'] || ''
    settings: new UserSettings()
    token: null
    runKeeperProfile: profile


  # Computes functional Threshold Pace (FTP) given best race result
  # of type {time: Time, distance: Distance}
  # http://www.joefrielsblog.com/2010/05/quick-guide-to-training-with-heart-rate-power-and-pace.html
  @computeFunctionalThresholdPace = (bestRace) ->
    return null   # TODO(koper) Implement...


  getHrZoneBoundaries: ->
    maxHR = @performance?.maxHR
    if maxHR?
      return _.map HR_ZONE_BOUNDARIES, (adjuster) -> maxHR - adjuster
    else
      return null


  getElevationZoneBoundaries: ->
    return ELEVATION_ZONE_BOUNDARIES


  getRunningPaceZoneBoundaries: ->
    runBestDistance = @performance?.runBestDistance
    runBestTime = @performance?.runBestTime
    if runBestDistance? && runBestTime?
      ftp = @computeFunctionalThresholdPace {
        distance: new Distance { meters: runBestDistance }
        time: new Time { seconds: runBestTime }
      }
      return _.map RUNNING_PACE_ZONE_BOUNDARIES, (multiplier) -> ftp.asKmPerHour() * multiplier / 100
    else
      return null
