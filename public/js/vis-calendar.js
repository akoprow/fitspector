// date manipulations
var getWeekday = d3.time.format("%w");
var getWeek = d3.time.format("%U");

var drawContainer = function(topMargin, cellSize, years) {
  var width = 2 + cellSize*53;
  var height = topMargin + cellSize * 8;

  // Main container
  var container = d3.select('#vis-calendar')
    .selectAll('svg')
    .data(years)
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
  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
}

var drawMonthBorders = function(container, cellSize) {
  container.selectAll(".month")
    .data(function(d) {
      return d3.time.months(
	  new Date(d, 0, 1),
	  new Date(d + 1, 0, 1));
    })
  .enter().append("path")
    .attr("class", "month")
    .attr("d", monthPath);
};

var draw = function(leftMargin, cellSize, years) {
  var container = drawContainer(leftMargin, cellSize, years);
  drawDayCells(container, cellSize);
  drawMonthBorders(container, cellSize);
};

// constants
var topMargin = 20;
var cellSize = 20;
var years = [2012, 2013];
draw(topMargin, cellSize, years);

/*
// data
var data = d3.nest()
  .key(function(d) { return d.date.getFullYear(); })
  .sortKeys(d3.ascending)
  .entries(workouts);

// Workout boxes
yearContainer.selectAll('.workout')
  .data(function(d) { return d.values; })
  .enter()
  .append('rect')
    .attr('class', 'workout')
    .attr('width', cellSize-1)
    .attr('height', cellSize-1)
    .attr('x', function(d) { return 1 + cellSize * getWeek(d.date); })
    .attr('y', function(d) { return 1 + cellSize * getWeekday(d.date); })
*/