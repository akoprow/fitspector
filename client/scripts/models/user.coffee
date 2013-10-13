'use strict';

root = exports ? this

class root.User
  @fromRunKeeperProfile = (profile) ->
    id: userId
    RKtoken: token
    name: profile.name
    isMale: profile.gender is 'M'
    birthday: new Date(profile.birthday)
    smallImgUrl: profile['medium_picture']
