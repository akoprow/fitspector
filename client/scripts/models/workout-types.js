(function() {
  'use strict';
  var DATA, root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  DATA = {
    arc: {
      name: 'Archery'
    },
    bbl: {
      name: 'Baseball'
    },
    bdm: {
      name: 'Badminton'
    },
    bkb: {
      name: 'Basketball'
    },
    bth: {
      name: 'Biathlon'
    },
    bik: {
      name: 'Cycling'
    },
    bob: {
      name: 'Bobsled'
    },
    box: {
      name: 'Boxing'
    },
    cli: {
      name: 'Climbing'
    },
    cur: {
      name: 'Curling'
    },
    div: {
      name: 'Scuba diving'
    },
    fen: {
      name: 'Fencing'
    },
    fbl: {
      name: 'Football'
    },
    fho: {
      name: 'Field hockey'
    },
    glf: {
      name: 'Golf'
    },
    gym: {
      name: 'Gymnastics'
    },
    hbl: {
      name: 'Handball'
    },
    hik: {
      name: 'Hiking'
    },
    hoc: {
      name: 'Hockey'
    },
    hrd: {
      name: 'Horseback riding'
    },
    isk: {
      name: 'Ice-skating'
    },
    row: {
      name: 'Rowing'
    },
    rsk: {
      name: 'Roller skating'
    },
    run: {
      name: 'Running'
    },
    sai: {
      name: 'Sailing'
    },
    sho: {
      name: 'Shooting'
    },
    ski: {
      name: 'Skiing'
    },
    sqs: {
      name: 'Squash'
    },
    srk: {
      name: 'Snorkeling'
    },
    swi: {
      name: 'Swimming'
    },
    tbt: {
      name: 'Table tennis'
    },
    ten: {
      name: 'Tennis'
    },
    tkd: {
      name: 'Taekwondo'
    },
    xcs: {
      name: 'Cross-country skiing'
    },
    vlb: {
      name: 'Volleyball'
    },
    wsr: {
      name: 'Wind surfing'
    },
    wtr: {
      name: 'Weight training'
    },
    wre: {
      name: 'Wrestling'
    },
    yog: {
      name: 'Yoga'
    }
  };

  root.WorkoutType = _.chain(DATA).map(function(sport, id) {
    return [
      id, _.extend(sport, {
        id: id
      })
    ];
  }).object().value();

}).call(this);
