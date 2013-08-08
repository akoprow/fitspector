var dataset = [
  { date: new Date(2012, 11, 3), distance: 10.2 },
  { date: new Date(2013, 5, 7),  distance:  5.4 }
];

// constants
var leftMargin = 30;
var cellSize = 20;

var width = leftMargin + cellSize*53 + 1;
var height = cellSize * 8;

// date manipulations
var getWeekday = d3.time.format("%w");
var getWeek = d3.time.format("%U");

// data
var data = d3.nest()
  .key(function(d) { return d.date.getFullYear(); })
  .sortKeys(d3.ascending)
  .entries(dataset);

// container
var year = d3.select('#vis-calendar')
  .selectAll('svg')
  .data(data)
  .enter()
    .append('svg')
    .attr('class', 'year')
    .attr('width', width)
    .attr('height', height);

// Year label
year.append('text')
  .attr('transform', 'translate(10,' + cellSize * 3.5 + ') rotate(-90)')
  .style('text-anchor', 'middle')
  .text(function(d) { return d.key; });

var yearContainer = year.append('g')
  .attr('transform', 'translate(' + leftMargin + ',' + 0.5 * cellSize + ')');

// Day cells
var day = yearContainer
    .selectAll('.day')
    .data(function(d) {
      return d3.time.days(
	  new Date(+d.key, 0, 1),
	  new Date(+d.key + 1, 0, 1));
    })
  .enter().append('rect')
    .attr('class', 'day')
    .attr('width', cellSize)
    .attr('height', cellSize)
    .attr('x', function(d) { return cellSize * getWeek(d); })
    .attr('y', function(d) { return cellSize * getWeekday(d); });

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

// Month boxes
yearContainer.selectAll(".month")
    .data(function(d) {
      return d3.time.months(
	  new Date(+d.key, 0, 1),
	  new Date(+d.key + 1, 0, 1));
    })
  .enter().append("path")
    .attr("class", "month")
    .attr("d", monthPath);

function monthPath(t0) {
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