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

var sports = {
  'run': {
    name: 'Running',
    color: '#b3dc6c'
  },
  'wt': {
    name: 'Weight training',
    color: '#9fc6e7'
  },
  'yoga': {
    name: 'Yoga',
    color: '#fad165'
  },
  'hik': {
    name: 'Hiking',
    color: '#ac725e'
  },
  'volb': {
    name: 'Volleyball',
    color: '#f691b2'
  },
  'sq': {
    name: 'Squash',
    color: '#b99aff'
  },
  'xcs': {
    name: 'Cross-country skiing',
    color: '#c2c2c2'
  }
}

// sport = 'all' or sport id
// unit = 'time' or 'distance'
// group = 'exercises' or 'zones'
var prepareData = function(year, sport, unit, group) {
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

  // Compute visual representation.
  data = _.map(data, function(d) {
    var total = 0;
    return _.map(d.exercises, function(e) {
      if (!sports[e.exerciseType]) {
	throw new Error('Unknown exercise: ' + e.exerciseType);
      }
      total += (unit == 'time' ? e.totalTime : e.totalDistance);
      return {
	day: d.day,
	value: total,
	color: sports[e.exerciseType].color,
	key: d.day
      };
    });
  });

  // Join all data into a single array and reverse it.
  var res = [];
  data = res.concat.apply(res, data);
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
      .data(data, function(d) { return d.key; });
  var duration = 300;

  workouts.exit().transition()
      .duration(duration)
      .ease('circle')
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
      .ease('circle')
      .attr('width', function(d) { return sizeScale(d.value); })
      .attr('height', function(d) { return sizeScale(d.value); })
      .attr('x', function(d) { return xScale(+getWeek(d.day) + 0.5) - sizeScale(d.value)/2; })
      .attr('y', function(d) { return yScale(+getWeekday(d.day) + 0.5) - sizeScale(d.value)/2; })
      .style('fill', function(d) { return d.color; });
};

var draw = function(container, cellSize, year) {
  drawDayCells(container, cellSize);
  var show =
      d3.select('#show-time').classed('active') ? 'time' :
	  (d3.select('#show-distance').classed('active') ? 'distance' : 'elevation');
  var sport = $('#sport-filter-active #sport').attr('data-value');
  var data = prepareData(year, sport, show, 'exercises');
  drawWorkouts(container, cellSize, data);
  drawMonthBorders(container, cellSize);
};

// constants
var topMargin = 20;
var cellSize = 45;

var container = drawContainer(topMargin, cellSize, 2013);

var redraw = function() {
  draw(container, cellSize, 2013);
}

redraw();

$('#show-choice .btn').on('click', function(event) {
  event.stopPropagation();
  $('#show-choice .btn').removeClass('active');
  $(this).addClass('active');
  redraw();
});

var sportsPlusAll = _.extend({'all': {name: 'All'}}, sports);
_.each(sportsPlusAll, function(value, key, list) {
  var a = $('<a href="#">' + value.name + '</a>').on('click', function(event) {
    $('#sport-filter-active').empty().append('<span id="sport" data-value="' + key + '">' + value.name + '</span>');
    redraw();
  });
  $('#sport-filter').append($('<li>').append(a));
});
