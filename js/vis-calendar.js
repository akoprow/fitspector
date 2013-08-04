var dataset = [
  new Date(2012, 11, 3),
  new Date(2013, 5, 7)
];

var leftMargin = 30;
var cellSize = 20;

var width = cellSize * 53 + leftMargin;
var height = cellSize * 7;

var year = d3.select("#vis-calendar")
  .selectAll("svg")
    .data(d3.range(2005, 2013))
  .enter()
    .append("svg")
    .attr("width", width)
    .attr("height", height);

year.append("text")
  .attr("transform", "translate(" + leftMargin + "," + cellSize * 3.5 + ") rotate(-90)")
  .style("text-anchor", "middle")
  .text(function(d) { return d; });
