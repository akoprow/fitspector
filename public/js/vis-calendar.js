function VisCalendar($scope) {
  $scope.sports = {
    all: { name: 'All' },
    run: { name: 'Running', color: '#b3dc6c' },
    wt: { name: 'Weight training', color: '#9fc6e7' },
    yoga: { name: 'Yoga', color: '#fad165' },
    hik: { name: 'Hiking', color: '#ac725e' },
    volb: { name: 'Volleyball', color: '#f691b2' },
    sq: { name: 'Squash', color: '#b99aff' },
    xcs: { name: 'Cross-country skiing', color: '#c2c2c2' }
  };

  $scope.allSports = _.map(['all', 'run', 'wt', 'yoga', 'hik', 'volb', 'sq', 'xcs'], function(sport) {
    return _.extend($scope.sports[sport], { id: sport });
  });
  $scope.allDisplayTypes = [
    {
      id: 'time',
      name: 'Time',
      icon: 'time'
    },
    {
      id: 'distance',
      name: 'Distance',
      icon: 'road'
    },
    {
      id: 'hr',
      name: 'HR zones',
      icon: 'heart'
    },
    {
      id: 'pace',
      name: 'Pace zones',
      icon: ''
    },
    {
      id: 'elevation',
      name: 'Elevation zones',
      icon: 'signal'
    }
  ];

  $scope.timeZoneColors = ['#ccc', "#fee5d9","#fcbba1","#fc9272","#fb6a4a","#de2d26","#a50f15"];
  $scope.paceZoneColors = ['#ccc', "#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#756bb1","#54278f"];
  $scope.year = 2013;
  $scope.sportFilter = $scope.allSports[0];
  $scope.displayType = $scope.allDisplayTypes[0];

  $scope.setSportFilter = function(sport) {
    $scope.sportFilter = sport;
    redraw($scope);
  }
  $scope.setDisplayType = function(type) {
    $scope.displayType = type;
    redraw($scope);
  }

  redraw($scope);
};

// date manipulations
var getWeekday = d3.time.format('%w');
var getWeek = d3.time.format('%U');

var computeData = function() {
  var sum = function(d) {
    return _.reduce(d, function(x, y) { return x + y }, 0);
  };
  var makeWorkout = function(d) {
    var date = new Date(d.startedAt);
    return {
      exerciseType: d.exerciseType.toLowerCase(),
      day: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      date: date,
      time: d.time,
      pace: d.pace,
      totalTime: sum(d.time),
      totalDistance: sum(d.pace)
    }
  };
  var data = _.map(workouts, makeWorkout);
  var data = _.groupBy(data, function(d) { return d.day });
  var data = _.pairs(data);
  var data = _.map(data, function(d) { return { day: d[1][0].day, exercises: d[1] }; });
  return data;
};

var workoutsData = computeData();

var dailyDataBySports = function($scope, d) {
  var type = $scope.displayType.id;
  var total = 0;
  return _.map(d.exercises, function(e, idx) {
    if (!$scope.sports[e.exerciseType]) {
      throw new Error('Unknown exercise: ' + e.exerciseType);
    }
    switch (type) {
      case 'time':
        total += e.totalTime;
        break;
      case 'distance':
        total += e.totalDistance;
        break;
      default:
        throw Error('Unknown data type: ' + type);
    }
    return {
      day: d.day,
      key: d.day + idx,
      value: total,
      color: $scope.sports[e.exerciseType].color,
    };
  });
};

var addZones = function(z1, z2) {
  var data = _.zip(z1, z2);
  return _.map(data, function(values) {
    return _.reduce(values, function(v1, v2) { return v1 + v2; });
  });
};

var dailyDataByZones = function($scope, d) {
  var type = $scope.displayType.id;
  var zones = [0, 0, 0, 0, 0, 0, 0];
  var colors;
  switch (type) {
    case 'hr':
      colors = $scope.timeZoneColors;
      break;
    case 'pace':
      colors = $scope.paceZoneColors;
      break;
    default:
      throw Error('Unknown data type: ' + type);
  }

  _.each(d.exercises, function(e) {
    if (!$scope.sports[e.exerciseType]) {
      throw new Error('Unknown exercise: ' + e.exerciseType);
    }
    switch (type) {
      case 'time':
      case 'hr':
        zones = addZones(zones, e.time);
        break;
      case 'distance':
      case 'pace':
        zones = addZones(zones, e.pace);
        break;
      default:
        throw Error('Unknown data type: ' + type);
    }
  });
  zones = _.map(zones, function(zone, idx) {
    return {
      day: d.day,
      value: zone,
      color: colors[idx]
    };
  });
  zones = _.filter(zones, function(z) { return z.value > 0; });
  var total = 0;
  return _.map(zones, function(zone, idx) {
    total += zone.value;
    return {
      day: d.day,
      value: total,
      color: zone.color,
      key: d.day + idx
    }
  });
};

var filterData = function($scope) {
  var year = $scope.year;
  var sport = $scope.sportFilter.id;

  // Filter by year.
  var data = _.filter(workoutsData, function(d) {
    return d.day.getFullYear() === year;
  });

  // Filter by sport.
  data = _.map(data, function(d) {
    return {
      day: d.day,
      exercises: _.filter(d.exercises, function(e) {
	return sport === 'all' || e.exerciseType === sport;
      })
    };
  });

  return data;
};

var computeWorkoutData = function($scope, data) {
  var type = $scope.displayType.id;

  // Compute visual representation.
  data = _.map(data, function(d) {
    switch (type) {
      case 'time':
      case 'distance':
        return dailyDataBySports($scope, d);
      case 'hr':
      case 'pace':
        return dailyDataByZones($scope, d);
      default: throw Error('Unknown grouping: ' + type);
    }
  });

  // Join all data into a single array and reverse it.
  var res = [];
  data = res.concat.apply(res, data);
  return data.reverse();
};

var computeTotals = function($scope, data) {
  var type = $scope.displayType.id;
  var sportTotals = {};
  _.each(data, function(d) {
    _.each(d.exercises, function(e) {
      var v = sportTotals[e.exerciseType] || {time: 0, distance: 0, elevation: 0, num: 0};
      v.time += e.totalTime;
      v.distance += e.totalDistance;
      v.elevation += e.totalElevation;
      v.num++;
      sportTotals[e.exerciseType] = v;
    });
  });
  var data = _.map(sportTotals, function(value, key) {
    return _.extend(value, _.extend($scope.sports[key], {id: key}));
  });
  var sortBy;
  switch (type) {
    case 'time':
    case 'hr':
      sortBy = 'time';
      break;
    case 'distance':
    case 'pace':
      sortBy = 'distance';
      break;
    case 'elevation':
      sortBy = 'elevation';
      break;
    default: throw Error('Unknown type: ' + type);
  }
  data = _.sortBy(data, sortBy);
  return data.reverse();
};

var drawContainer = function(topMargin, cellSize, year) {
  var width = 2 + cellSize*53;
  var height = topMargin + cellSize * 8;

  // Main container
  var container = d3.select('#vis-calendar').selectAll('svg')
      .data([year], function(d) { return d })
      .enter()
      .append('svg')
      .attr('class', 'year')
      .attr('width', width)
      .attr('height', height);

  // Year label
  var offsetX = cellSize * 53 / 2;
  var offsetY = topMargin / 2;
  container.append('text')
    .attr('transform', 'translate(' + offsetX  + ',' + offsetY + ')')
    .attr('class', 'yearLabel')
    .style('text-anchor', 'middle')
    .style('alignment-baseline', 'central')
    .text(function(d) { return d; });

  // Container body
  var offsetY = 0.5*cellSize + topMargin;
  return container.append('g')
      .attr('transform', 'translate(1,' + offsetY + ')');
};

var drawDayCells = function(container, cellSize) {
  container.selectAll('.day')
    .data(function(d) {
      return d3.time.days(
	  new Date(d, 0, 1),
	  new Date(d + 1, 0, 1));
    })
  .enter()
    .append('rect')
    .attr('class', 'day')
    .attr('width', cellSize)
    .attr('height', cellSize)
    .attr('x', function(d) { return cellSize * getWeek(d); })
    .attr('y', function(d) { return cellSize * getWeekday(d); });
};

var monthPath = function(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0);
  var d0 = +getWeekday(t0);
  var w0 = +getWeek(t0);
  var d1 = +getWeekday(t1);
  var w1 = +getWeek(t1);
  return 'M' + (w0 + 1) * cellSize + ',' + d0 * cellSize
      + 'H' + w0 * cellSize + 'V' + 7 * cellSize
      + 'H' + w1 * cellSize + 'V' + (d1 + 1) * cellSize
      + 'H' + (w1 + 1) * cellSize + 'V' + 0
      + 'H' + (w0 + 1) * cellSize + 'Z';
}

var drawMonthBorders = function(container, cellSize) {
  container.selectAll('.month')
    .data(function(d) {
      return d3.time.months(
	  new Date(d, 0, 1),
	  new Date(d + 1, 0, 1));
    })
  .enter().append('path')
    .attr('class', 'month')
    .attr('d', monthPath);
};

var drawWorkouts = function(container, cellSize, data) {
  var xScale = d3.scale.linear()
      .domain([0, 52])
      .rangeRound([0, cellSize*52]);
  var yScale = d3.scale.linear()
      .domain([0, 6])
      .rangeRound([0, cellSize*6]);
  var sizeScale = d3.scale.sqrt()
      .domain([0, d3.max(data, function(d) { return d.value; })])
      .rangeRound([0, cellSize - 1]);

  var workouts = container.selectAll('.workout')
      .data(data, function(d, i) { return d.key; });
  var duration = 300;

  workouts.exit().transition()
      .duration(duration)
      .attr('width', 0)
      .attr('height', 0)
      .attr('x', function(d) { return xScale(+getWeek(d.day) + 0.5); })
      .attr('y', function(d) { return yScale(+getWeekday(d.day) + 0.5); })
      .remove();

  workouts.enter().append('rect')
      .attr('class', 'workout')
      .attr('width', 0)
      .attr('height', 0)
      .attr('x', function(d) { return xScale(+getWeek(d.day) + 0.5); })
      .attr('y', function(d) { return yScale(+getWeekday(d.day) + 0.5); });

  workouts.transition()
      .delay(duration)
      .duration(duration)
      .attr('width', function(d) { return sizeScale(d.value); })
      .attr('height', function(d) { return sizeScale(d.value); })
      .attr('x', function(d) { return xScale(+getWeek(d.day) + 0.5) - sizeScale(d.value)/2; })
      .attr('y', function(d) { return yScale(+getWeekday(d.day) + 0.5) - sizeScale(d.value)/2; })
      .style('fill', function(d) { return d.color; });
};

var drawSportIcons = function(data) {
  var boxes = d3.select('#sport-totals')
      .selectAll('img')
      .data(data);
  boxes.enter()
    .append('img')
    .classed('sport', true)
    .attr('data-toggle', 'popover')
    .attr('data-title', function(s) { return s.name; })
    .attr('data-html', true)
    .attr('data-placement', 'bottom')
    .attr('data-content', function(s) {
      return '<div class="sport-popover">' +
	  '<div class="sessions"><span class="text"><i class="icon icon-ok"></i> Sessions:</span><span class="value">' + s.num + 'x</span></div>' +
	  '<div class="time"><span class="text"><i class="icon icon-time"></i> Time:</span><span class="value">' + Math.floor(s.time/3600) + 'h</span></div>' +
	  '<div class="distance"><span class="text"><i class="icon icon-road"></i> Distance:</span><span class="value">' + Math.floor(s.distance/1000) + 'km</span></div>' +
	  '</div>'
    });

  boxes.exit()
    .remove();
  boxes
    .attr('src', function(s) {
      // TODO(koper) Change it into a property on sport.
      return 'img/sport/' + s.id + '.png';
    })
    .style('background-color', function(s) { return s.color; });
};

var draw = function($scope, container, cellSize, year) {
  drawDayCells(container, cellSize);
  var data = filterData($scope);
  var workoutData = computeWorkoutData($scope, data);
  drawWorkouts(container, cellSize, workoutData);
  var totals = computeTotals($scope, data);
  drawSportIcons(totals);
  drawMonthBorders(container, cellSize);
};

var topMargin = 20;
var cellSize = 45;

var container = drawContainer(topMargin, cellSize, 2013);

var redraw = function($scope) {
  draw($scope, container, cellSize);
};

$('body').popover({
  selector: 'img.sport',
  trigger: 'hover'
});
