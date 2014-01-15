'use strict';

userSettings = require('./userSettings')

root = exports ? this

class root.User
  @fromRunKeeperProfile = (profile, userId) ->
    id: userId
    name: profile.name
    isMale: profile.gender is 'M'
    birthday: new Date(profile.birthday)
    smallImgUrl: profile['small_picture'] || profile['medium_picture'] || profile['normal_picture'] || ''
    settings: new userSettings.UserSettings()
    token: null
    runKeeperProfile: profile
