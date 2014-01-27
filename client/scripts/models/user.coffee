'use strict';

UserSettings = if window? then UserSettings else require('./userSettings').UserSettings
Distance = if window? then Distance else require('./distance').Distance
Time = if window? then Distance else require('./time').Time
_ = if window? then window._ else require 'underscore'
moment = if window? then window.moment else require 'moment'


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

# For now we estimate FTP by the race result on 5K.  Below are speed factors to
# be applied to average speeds in races on different distances to convert to
# such an FTP estimate.
SPEED_FACTOR_5K = 1.0000
SPEED_FACTOR_10K = 1.0383
SPEED_FACTOR_HALF_MARATHON = 1.0971
SPEED_FACTOR_MARATHON = 1.1545


class root.User
  # TODO(koper) This just seriously sucks; I need a consistent, robust pattern for JSON serialization.
  constructor: (json) ->
    @id = json.id
    @name = json.name
    @smallImgUrl = json.smallImgUrl
    @token = json.token
    @performance = json.performance


  @jsonUserFromRunKeeperProfile: (profile, userId) =>
    user =
      id: userId
      name: profile.name
      isMale: profile.gender is 'M'
      smallImgUrl: profile['small_picture'] || profile['medium_picture'] || profile['normal_picture'] || ''
      settings: new UserSettings()
      token: null
      runKeeperProfile: profile

    if profile.birthday?
      user.birthday = new Date(profile.birthday)
      age = moment().diff moment(profile.birthday), 'years'
      user.performance =
        maxHR: 220 - age

    return user


  # Computes functional Threshold Pace (FTP) given best race result
  # of type {time: Time, distance: Distance}
  # http://www.joefrielsblog.com/2010/05/quick-guide-to-training-with-heart-rate-power-and-pace.html
  @computeFunctionalThresholdPace = (bestRace) =>
    raceSpeed = bestRace.distance.asKilometers() / bestRace.time.asHours()
    return switch bestRace.distance.asMeters()
      when Distance.RACE_DISTANCE_5K.asMeters() then raceSpeed
      when Distance.RACE_DISTANCE_10K.asMeters() then raceSpeed * SPEED_FACTOR_10K
      when Distance.RACE_DISTANCE_HALF_MARATHON.asMeters() then raceSpeed * SPEED_FACTOR_HALF_MARATHON
      when Distance.RACE_DISTANCE_MARATHON.asMeters() then raceSpeed * SPEED_FACTOR_MARATHON
      else throw new Error("Unknown race distance of #{bestRace.distance.asMeters()}m. ")


  getHrZoneBoundaries: =>
    maxHR = @performance?.maxHR
    if maxHR?
      return _.map HR_ZONE_BOUNDARIES, (adjuster) -> maxHR - adjuster
    else
      return null


  getElevationZoneBoundaries: =>
    return ELEVATION_ZONE_BOUNDARIES


  getRunningPaceZoneBoundaries: =>
    runBestDistance = @performance?.runBestDistance
    runBestTime = @performance?.runBestTime
    if runBestDistance? && runBestTime?
      ftp = root.User.computeFunctionalThresholdPace {
        distance: new Distance { meters: runBestDistance }
        time: new Time { seconds: runBestTime }
      }
      return _.map RUNNING_PACE_ZONE_BOUNDARIES, (multiplier) -> ftp * multiplier / 100
    else
      return null
