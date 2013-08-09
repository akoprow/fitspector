// date manipulations
var getWeekday = d3.time.format('%w');
var getWeek = d3.time.format('%U');

var computeData = function() {
  var sum = function(d) {
    return _.reduce(d, function(x, y) { return x + y }, 0);
  };
  var makeWorkout = function(d) {
    return {
      exerciseType: d.exerciseType,
      date: new Date(d.startedAt),
      time: d.time,
      pace: d.pace,
      totalTime: sum(d.time),
      totalDistance: sum(d.pace)
    }
  };
  return _.map(workouts, makeWorkout);
};

var workoutsData = computeData();

var prepareData = function(year) {
  var exerciseTypeColor = d3.scale.category10();

  var data = workoutsData.filter(function(d) { return d.date.getFullYear() === year; });
  return data.map(function(d) {
    return {
      date: new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate()),
      value: d.totalTime,
      color: exerciseTypeColor(d.exerciseType)
    };
  });
};

var drawContainer = function(topMargin, cellSize, year) {
  var width = 2 + cellSize*53;
  var height = topMargin + cellSize * 8;

  // Main container
  var container = d3.select('#vis-calendar')
    .data([year])
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
      .rangeRound([1, 1 + cellSize*52]);
  var yScale = d3.scale.linear()
      .domain([0, 6])
      .rangeRound([1, 1 + cellSize*6]);
  var sizeScale = d3.scale.sqrt()
      .domain([0, d3.max(data, function(d) { return d.value; })])
      .rangeRound([0, cellSize - 1]);

  container.selectAll('workout')
    .data(data)
    .enter()
    .append('rect')
      .attr('class', 'workout')
      .attr('width', function(d) { return sizeScale(d.value); })
      .attr('height', function(d) { return sizeScale(d.value); })
      .attr('x', function(d) { return xScale(+getWeek(d.date) + 0.5) - sizeScale(d.value)/2; })
      .attr('y', function(d) { return yScale(+getWeekday(d.date) + 0.5) - sizeScale(d.value)/2; })
      .style('fill', function(d) { return d.color; });
};

var redraw = function(leftMargin, cellSize, year) {
  var container = drawContainer(leftMargin, cellSize, year);
  drawDayCells(container, cellSize);
  var data = prepareData(year);
  drawWorkouts(container, cellSize, data);
  drawMonthBorders(container, cellSize);
};

// constants
var topMargin = 20;
var cellSize = 20;
redraw(topMargin, cellSize, 2013);
