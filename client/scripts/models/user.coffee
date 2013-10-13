'use strict';

root = exports ? this

class root.User
  @fromRunKeeperProfile = (profile) ->
    id: userId
    # TODO(koper) This should be secret and never exposed to the clients!!!
    RKtoken: token
    name: profile.name
    isMale: profile.gender is 'M'
    birthday: new Date(profile.birthday)
    smallImgUrl: profile['medium_picture']
