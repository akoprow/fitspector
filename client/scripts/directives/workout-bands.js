(function() {
  'use strict';
  var MARGIN, MONTH_HEIGHT, MONTH_LABEL_HEIGHT, SPACING, SPORT_ICON_WIDTH, TOTAL_HEIGHT, WorkoutBands, dataForMode, dataMaxForMode, drawBands, drawGrid, drawMonthLabels, drawSportIcons, recomputeData, yScale;

  MARGIN = {
    bottom: 30,
    left: 30,
    right: 10
  };

  SPACING = {
    verticalBetweenMonths: 3
  };

  MONTH_HEIGHT = 30;

  MONTH_LABEL_HEIGHT = 11;

  TOTAL_HEIGHT = MARGIN.bottom + SPACING.verticalBetweenMonths + MONTH_HEIGHT * 12;

  SPORT_ICON_WIDTH = 50;

  WorkoutBands = (function() {
    function WorkoutBands(WorkoutsProviderService, $compile) {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'views/directives/workout-bands.html',
        scope: {
          year: '@',
          valueMode: '='
        },
        link: function(scope, elt) {
          var recompute, redraw, setBaselineSport;
          setBaselineSport = function(sport) {
            return scope.$apply(function() {
              var index, sports;
              sports = scope.data.allSports;
              index = _.indexOf(sports, sport);
              sports.splice(index, 1);
              return sports.unshift(sport);
            });
          };
          redraw = function() {
            var compile;
            if (scope.valueMode == null) {
              return;
            }
            compile = function(html) {
              return $compile(html)(scope);
            };
            drawMonthLabels(elt);
            drawBands(elt, scope.data, scope.valueMode, 2013);
            drawGrid(elt, scope.data, scope.valueMode);
            return drawSportIcons(elt, compile, setBaselineSport, scope.data.allSports);
          };
          recompute = function() {
            var allWorkouts;
            allWorkouts = WorkoutsProviderService.getAllWorkouts();
            scope.data = recomputeData(allWorkouts);
            return redraw();
          };
          scope.height = TOTAL_HEIGHT;
          scope.margin = MARGIN;
          scope.$on('workouts.update', function() {
            return scope.$apply(recompute);
          });
          recompute();
          scope.$watch((function() {
            return elt.clientWidth;
          }), redraw);
          scope.$watch((function() {
            return elt.clientHeight;
          }), redraw);
          scope.$watch('valueMode', redraw);
          return scope.$watchCollection('data.allSports', redraw);
        }
      };
    }

    return WorkoutBands;

  })();

  recomputeData = function(workouts) {
    var allSports, workoutsData;
    workoutsData = _.chain(workouts).groupBy(function(workout) {
      return workout.startTime.clone().startOf('month').valueOf();
    }).map(function(workouts, month) {
      return {
        time: Number(month),
        sports: _.chain(workouts).groupBy(function(workout) {
          return workout.exerciseType.id;
        }).map(function(workouts, exerciseTypeId) {
          return {
            exerciseType: WorkoutType[exerciseTypeId],
            totalDuration: d3.sum(workouts, function(workout) {
              return workout.totalDuration.asHours();
            }),
            totalDistance: d3.sum(workouts, function(workout) {
              return workout.totalDistance.asKilometers();
            }),
            totalElevation: d3.sum(workouts, function(workout) {
              return workout.totalElevation.asMeters();
            })
          };
        }).sortBy(function(data) {
          return data.exerciseType.id;
        }).value()
      };
    }).map(function(monthlyData) {
      return _.extend(monthlyData, {
        totalDuration: d3.sum(monthlyData.sports, function(monthlySummary) {
          return monthlySummary.totalDuration;
        }),
        totalDistance: d3.sum(monthlyData.sports, function(monthlySummary) {
          return monthlySummary.totalDistance;
        }),
        totalElevation: d3.sum(monthlyData.sports, function(monthlySummary) {
          return monthlySummary.totalElevation;
        })
      });
    }).value();
    allSports = _.chain(workoutsData).map(function(w) {
      return _.map(w.sports, function(s) {
        return s.exerciseType;
      });
    }).flatten().uniq(function(e) {
      return e.id;
    }).value();
    return {
      workouts: workoutsData,
      allSports: allSports,
      maxDuration: d3.max(workoutsData, function(d) {
        return d.totalDuration;
      }),
      maxDistance: d3.max(workoutsData, function(d) {
        return d.totalDistance;
      }),
      maxElevation: d3.max(workoutsData, function(d) {
        return d.totalElevation;
      })
    };
  };

  yScale = d3.scale.linear().domain([0, 1]).range([0, MONTH_HEIGHT]);

  drawMonthLabels = function(elt) {
    var container;
    container = d3.select(elt[0]).select('g.time-axis').selectAll('text').data(d3.range(0, 12));
    container.enter().append('svg:text').attr('x', 0).attr('y', 0).text(function(d) {
      return moment().month(d).format('MMM');
    });
    container.attr('y', function(d, i) {
      return SPACING.verticalBetweenMonths + (MONTH_HEIGHT - MONTH_LABEL_HEIGHT) / 2 + (yScale(i));
    });
    return container.exit().remove();
  };

  dataMaxForMode = function(data, valueMode) {
    switch (valueMode) {
      case 'duration':
        return data.maxDuration;
      case 'distance':
        return data.maxDistance;
      case 'elevation':
        return data.maxElevation;
      default:
        throw new Error("Unknown value mode: " + valueMode);
    }
  };

  dataForMode = function(data, valueMode) {
    switch (valueMode) {
      case 'duration':
        return data.totalDuration;
      case 'distance':
        return data.totalDistance;
      case 'elevation':
        return data.totalElevation;
      default:
        throw new Error("Unknown value mode: " + valueMode);
    }
  };

  drawBands = function(elt, data, valueMode, year) {
    var monthLabel, rows, showRow, sportIndex, viewport, workouts, xScale;
    sportIndex = function(sport) {
      return _.indexOf(data.allSports, sport);
    };
    workouts = _.chain(data.workouts).filter(function(d) {
      return moment(d.time).year() === year;
    }).map(function(d) {
      var y;
      y = 0;
      d.sports = _.chain(d.sports).sortBy(function(s) {
        return sportIndex(s.exerciseType);
      }).map(function(s) {
        return _.extend(s, {
          y0: y,
          y1: y += dataForMode(s, valueMode)
        });
      }).value();
      return d;
    }).value();
    viewport = elt[0];
    monthLabel = d3.time.format('%B %Y');
    xScale = d3.scale.linear().domain([0, dataMaxForMode(data, valueMode)]).range([0, viewport.clientWidth - MARGIN.left - MARGIN.right]);
    showRow = function(rd) {
      var row;
      row = d3.select(this).selectAll('rect.col').data((function(d) {
        return d.sports;
      }), (function(s) {
        return s.exerciseType.id;
      }));
      row.transition().attr('fill', function(d) {
        return d.exerciseType.color;
      }).attr('stroke', function(d) {
        return d3.rgb(d.exerciseType.color).darker();
      }).attr('width', function(d) {
        return xScale(d.y1 - d.y0);
      }).attr('x', function(d) {
        return xScale(d.y0);
      });
      return row.enter().append('svg:rect').attr('class', 'col').attr('x', 0).attr('y', function(d) {
        return SPACING.verticalBetweenMonths + yScale(moment(rd.time).month());
      }).attr('width', 0).attr('height', MONTH_HEIGHT - SPACING.verticalBetweenMonths).each(function() {
        return $(this).popover({
          trigger: 'hover',
          container: '.workout-bands',
          title: monthLabel(new Date(rd.time)),
          content: 'Blah'
        });
      });
    };
    rows = d3.select(viewport).select('g.bands').selectAll('g.row').data(workouts);
    rows.enter().append('svg:g').attr('class', 'row');
    return rows.transition().each(showRow);
  };

  drawGrid = function(elt, data, valueMode) {
    var labelUnit, rule, viewport, xScale;
    viewport = elt[0];
    xScale = d3.scale.linear().domain([0, dataMaxForMode(data, valueMode)]).range([0, viewport.clientWidth - MARGIN.left - MARGIN.right]);
    labelUnit = (function() {
      switch (valueMode) {
        case 'duration':
          return 'h';
        case 'distance':
          return 'km';
        case 'elevation':
          return 'm';
        default:
          throw new Error("Unknown value mode: " + valueMode);
      }
    })();
    rule = d3.select(elt[0]).select('.value-axis').selectAll('g.rule').data(xScale.ticks(10));
    rule.enter().append('svg:g').attr('class', 'rule').attr('transform', "translate(" + viewport.clientWidth + ", 0)").each(function(d) {
      d3.select(this).append('svg:line').attr('y2', TOTAL_HEIGHT - MARGIN.bottom).style("stroke", function(d) {
        if (d) {
          return '#f5f5f5';
        } else {
          return '#000';
        }
      }).style("stroke-opacity", function(d) {
        if (d) {
          return .7;
        } else {
          return null;
        }
      });
      return d3.select(this).append('svg:text').attr('dy', '.35em').attr('y', TOTAL_HEIGHT - MARGIN.bottom);
    });
    rule.exit().transition().attr('transform', "translate(" + viewport.clientWidth + ", 0)").remove();
    return rule.transition().attr('transform', function(d) {
      return "translate(" + (xScale(d)) + ", 0)";
    }).select('text').text(function(d) {
      return d3.format(",d")(d) + labelUnit;
    });
  };

  drawSportIcons = function(elt, compile, setBaselineSport, sports) {
    var sportsList;
    sportsList = d3.select(elt[0]).select('.exercise-types-list').selectAll('li').data(sports, function(d) {
      return d.id;
    });
    sportsList.enter().append(function(d) {
      return compile("<li><sport-icon exercise-type-id='" + d.id + "'></sport-icon></li>")[0];
    }).on('click', function(d) {
      return setBaselineSport(d);
    });
    return sportsList.transition().style('left', function(d, i) {
      return "" + (SPORT_ICON_WIDTH * i) + "px";
    });
  };

  angular.module('fitspector').directive('workoutBands', ['WorkoutsProviderService', '$compile', WorkoutBands]);

}).call(this);
