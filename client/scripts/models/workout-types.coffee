'use strict'

root = exports ? this

colors = _.range(0, 20).map d3.scale.category20()
color = (i) -> colors[i]

DATA =
  arc:
    name: 'Archery'
    color: color(1)
  bbl:
    name: 'Baseball'
    color: color(0)
  bdm:
    name: 'Badminton'
    color: color(2)
  bkb:
    name: 'Basketball'
    color: color(3)
  bth:
    name: 'Biathlon'
    color: color(4)
  bik:
    name: 'Cycling'
    color: color(7)
  bob:
    name: 'Bobsled'
    color: color(6)
  box:
    name: 'Boxing'
    color: color(8)
  cli:
    name: 'Climbing'
    color: color(10)
  cur:
    name: 'Curling'
    color: color(12)
  div:
    name: 'Scuba diving'
    color: color(13)
  fen:
    name: 'Fencing'
    color: color(14)
  fbl:
    name: 'Football'
    color: color(15)
  fho:
    name: 'Field hockey'
    color: color(18)
  glf:
    name: 'Golf'
    color: color(19)
  gym:
    name: 'Gymnastics'
    color: color(0)
  hbl:
    name: 'Handball'
    color: color(2)
  hik:
    name: 'Hiking'
    color: color(11)
  hoc:
    name: 'Hockey'
    color: color(3)
  hrd:
    name: 'Horseback riding'
    color: color(4)
  isk:
    name: 'Ice-skating'
    color: color(6)
  row:
    name: 'Rowing'
    color: color(8)
  rsk:
    name: 'Roller skating'
    color: color(10)
  run:
    name: 'Running'
    color: color(5)
  sai:
    name: 'Sailing'
    color: color(12)
  sho:
    name: 'Shooting'
    color: color(13)
  ski:
    name: 'Skiing'
    color: color(14)
  sqs:
    name: 'Squash'
    color: color(15)
  srk:
    name: 'Snorkeling'
    color: color(18)
  swi:
    name: 'Swimming'
    color: color(16)
  tbt:
    name: 'Table tennis'
    color: color(19)
  ten:
    name: 'Tennis'
    color: color(0)
  tkd:
    name: 'Taekwondo'
    color: color(2)
  xcs:
    name: 'Cross-country skiing'
    color: color(3)
  vlb:
    name: 'Volleyball'
    color: color(9)
  wsr:
    name: 'Wind surfing'
    color: color(4)
  wtr:
    name: 'Weight training'
    color: color(1)
  wre:
    name: 'Wrestling'
    color: color(6)
  yog:
    name: 'Yoga'
    color: color(17)
  oth:
    name: 'Other'
    color: color(5)


# TODO(koper) Change into Angular constant
root.WorkoutType = 
  _.chain(DATA)
    .map((sport, id) ->
      col = d3.hsl sport.color
      bgColor = d3.hsl col.h, col.s, 0.99
      [id, _.extend sport, { id: id, bgColor: bgColor }]
    )
    .object()
    .value()
