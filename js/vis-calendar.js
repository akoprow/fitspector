var dataset = [
  new Date(2012, 11, 3),
  new Date(2013, 5, 7)
];

// constants
var leftMargin = 30;
var cellSize = 20;

var width = leftMargin + cellSize * 53 + 1;
var height = cellSize * 8;

// date manipulations
var getWeekday = d3.time.format("%w");
var getWeek = d3.time.format("%U");

// container
var year = d3.select('#vis-calendar')
  .selectAll('svg')
    .data(d3.range(2010, 2014))
  .enter()
    .append('svg')
    .attr('width', width)
    .attr('height', height);

// Year label
year.append('text')
  .attr('transform', 'translate(10,' + cellSize * 3.5 + ') rotate(-90)')
  .style('text-anchor', 'middle')
  .text(function(d) { return d; });

// Day boxes
var day = year.append('g')
  .attr('transform', 'translate(' + leftMargin + ')')
  .selectAll('.day')
  .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append('rect')
    .attr('class', 'day')
    .attr('width', cellSize)
    .attr('height', cellSize)
    .attr('x', function(d) { return cellSize * getWeek(d); })
    .attr('y', function(d) { return cellSize * getWeekday(d); });
