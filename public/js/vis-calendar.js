// TODO: Make 'data' service.
// TODO: Make workouts directive.

// --------------------------------------------------------------------------------------------------------
// ------------------------------------------- Angular modules --------------------------------------------
// --------------------------------------------------------------------------------------------------------

var services = angular.module('fitspector.services', []);
var directives = angular.module('fitspector.directives', []);
var app = angular.module('fitspector', ['fitspector.directives', 'fitspector.services']);

// --------------------------------------------------------------------------------------------------------
// ----------------------------------------------- Globals ------------------------------------------------
// --------------------------------------------------------------------------------------------------------

// TODO(koper) Use Angular-UI instead? Use d3-bootstrap?
$('body').tooltip({
  selector: '[rel=tooltip]'
});
$('body').popover({
  selector: '[rel=popover]'
});

// Constants
var TRANSITIONS_DURATION = 400;

// --------------------------------------------------------------------------------------------------------
// ----------------------------------------- DataProvider service -----------------------------------------
// --------------------------------------------------------------------------------------------------------

services.factory('DataProvider', function() {
  var sports = {
    run: { name: 'Running', color: '#b3dc6c' },
    wt: { name: 'Weight training', color: '#9fc6e7' },
    yoga: { name: 'Yoga', color: '#fad165' },
    hik: { name: 'Hiking', color: '#ac725e' },
    volb: { name: 'Volleyball', color: '#f691b2' },
    sq: { name: 'Squash', color: '#b99aff' },
    xcs: { name: 'Cross-country skiing', color: '#cca6ac' }
  };
  var workoutsData = computeData();

  return {
    // TODO(koper) This should not be exposed; instead we should have appropriate ways to access data.
    workoutsData: workoutsData,
    sports: sports,
    allSports: _.map(_.keys(sports), function(sport) {
      return _.extend(sports[sport], { id: sport });
    }),
    getDayWorkouts: function(day) {
      return workoutsData[day];
    }
  };
});

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
  var data = _.groupBy(data, "day");
  return data;
};

// --------------------------------------------------------------------------------------------------------
// ------------------------------------------- workout directive ------------------------------------------
// --------------------------------------------------------------------------------------------------------

directives.directive('workout', ['DataProvider', function(DataProvider) {
  return {
    restrict: 'E',
    templateUrl: 'views/workout.html',
    scope: {
      model: '='
    },
  };
}]);

// --------------------------------------------------------------------------------------------------------
// ------------------------------------------ workouts directive ------------------------------------------
// --------------------------------------------------------------------------------------------------------

directives.directive('workouts', ['DataProvider', function(DataProvider) {
  return {
    restrict: 'E',
    template: '<workout ng-repeat="workout in workouts" model="workout"></workout>',
    scope: {},
    link: function($scope, element, attrs) {
      // TODO(koper) This should take workouts data from DataService instead of the global variable.
      var day = new Date(parseInt(attrs.day));
      $scope.workouts = DataProvider.getDayWorkouts(day);
    }
  };
}]);

// --------------------------------------------------------------------------------------------------------
// ---------------------------------------- VisCalendar controller ----------------------------------------
// --------------------------------------------------------------------------------------------------------

// Calendar controller
app.controller('VisCalendar', ['$scope', 'DataProvider', function($scope, DataProvider) {
  $scope.allSportSummaryTypes = [
    {id: 'weeklyAvg', name: 'Weekly avg.'},
    {id: 'total', name: 'Total'}
  ];
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
      icon: 'fast-forward'
    },
    {
      id: 'elevation',
      name: 'Elevation zones',
      icon: 'signal'
    }
  ];
  // TODO(koper) This should be changed to now in the final product (+ possibly remove property)
  $scope.now = new Date(2013, 6, 31);

  // TODO(koper) Change into year selection component and get rid of literals.
  $scope.year = { id: 2013 };
  $scope.disablePrevYear = function() {
    return $scope.year.id <= 2012;
  };
  $scope.disableNextYear = function() {
    return $scope.year.id >= 2013;
  };
  $scope.currentYear = function() {
    $scope.year.id = 2013;
  };
  $scope.nextYear = function() {
    if (!$scope.disableNextYear()) {
      $scope.year.id++;
    }
  };
  $scope.prevYear = function() {
    if (!$scope.disablePrevYear()) {
      $scope.year.id--;
    };
  };

  $scope.timeZoneColors = ['#ccc', "#fee5d9","#fcbba1","#fc9272","#fb6a4a","#de2d26","#a50f15"];
  $scope.paceZoneColors = ['#ccc', "#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#756bb1","#54278f"];
  $scope.sportFilter = { id: 'all' };
  $scope.displayType = $scope.allDisplayTypes[0];
  $scope.sportSummaryType = $scope.allSportSummaryTypes[0];

  $scope.topMargin = 15;
  $scope.cellSize = 45;

  var container = drawCalendar($scope);
  var redraw = function() {
    drawData($scope, DataProvider, container);
  };

  $scope.setSportFilter = function(sport) {
    $scope.sportFilter = sport;
    redraw();
  };
  $scope.setDisplayType = function(type) {
    $scope.displayType = type;
    redraw();
  };
  $scope.setSportSummaryType = function(type) {
    $scope.sportSummaryType = type;
    redraw();
  };
  $scope.getExplanations = function() {
    return getExplanations($scope);
  };

  redraw();
}]);

var getExplanations = function($scope) {
  var getGeneralText = function() {
    switch ($scope.displayType.id) {
      case 'time':
        return 'You are visualizing workout time, grouped by different sports.';
      case 'distance':
        return 'You are visualizing workout distance, grouped by different sports.';
      case 'hr':
        return 'You are visualizing workout time, grouped by HR zones.';
      case 'pace':
        return 'You are visualizing workout distance, grouped by pace zones.';
      case 'elevation':
        return 'You are visualizing workout elevation change, grouped by climb categories.';
    };
  };
  var getSizeText = function() {
    switch ($scope.displayType.id) {
      case 'hr':
      case 'time':
        return 'Box sizees correspond to workout time (see legend on the right)';
      case 'pace':
      case 'distance':
      case 'elevation':
        return 'Box sizes correspond to workout distance (see legend on the right)';
    };
  };
  var getColorText = function() {
    switch ($scope.displayType.id) {
      case 'time':
      case 'distance':
        return 'Box colors correspond to workout types (see sports list on the left)';
      case 'hr':
        return 'Box colors correspond to HR zones (see legend on the right)';
      case 'pace':
        return 'Box colors correspond to pace zones (see legend on the right)';
      case 'elevation':
        return 'Box colors correspond to climb categories (see legend on the right)';
    };
  };
  return [getGeneralText(), getSizeText(), getColorText()];
};

var dailyDataBySports = function($scope, DataProvider, d) {
  var type = $scope.displayType.id;
  var total = 0;
  return _.map(d.exercises, function(e, idx) {
    if (!DataProvider.sports[e.exerciseType]) {
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
      color: DataProvider.sports[e.exerciseType].color,
    };
  });
};

var addZones = function(z1, z2) {
  var data = _.zip(z1, z2);
  return _.map(data, function(values) {
    return _.reduce(values, function(v1, v2) { return v1 + v2; });
  });
};

var dailyDataByZones = function($scope, DataProvider, d) {
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
    if (!DataProvider.sports[e.exerciseType]) {
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

var filterData = function($scope, DataProvider) {
  var year = $scope.year.id;
  var sport = $scope.sportFilter.id;

  var workouts = _.pairs(DataProvider.workoutsData);
  workouts = _.map(workouts, function(d) { return { day: d[1][0].day, exercises: d[1] }; });

  // Filter by year.
  var data = _.filter(workouts, function(d) {
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

var computeWorkoutData = function($scope, DataProvider, data) {
  var type = $scope.displayType.id;

  // Compute visual representation.
  data = _.map(data, function(d) {
    switch (type) {
      case 'time':
      case 'distance':
        return dailyDataBySports($scope, DataProvider, d);
      case 'hr':
      case 'pace':
        return dailyDataByZones($scope, DataProvider, d);
      default: throw Error('Unknown grouping: ' + type);
    }
  });

  // Join all data into a single array and reverse it.
  var res = [];
  data = res.concat.apply(res, data);
  return data.reverse();
};

var computeTotals = function($scope, DataProvider, data) {
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
    return _.extend(value, _.extend(DataProvider.sports[key], {id: key}));
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

var drawCalendar = function($scope) {
  var width = 2 + $scope.cellSize*53;
  var height = $scope.topMargin + $scope.cellSize * 8;
  var getWeek = d3.time.format('%U');

  // Main container
  var container = d3.select('#vis-calendar').selectAll('svg')
      .data([$scope.year.id])
      .enter()
      .append('svg')
      .attr('class', 'year')
      .attr('width', width)
      .attr('height', height);

  // Monthly labels
  var offsetY = $scope.topMargin / 2;
  container.selectAll('.monthLabel')
    .data(function(year) {
      return d3.time.months(
	  new Date(year, 0, 1),
	  new Date(year + 1, 0, 1));
    })
  .enter()
    .append('text')
    .attr('class', 'monthLabel')
    .attr('transform', function(d1) {
      var dateOffset = function(d) {
	var week = +getWeek(d);
	return week * $scope.cellSize;
      };
      var d2 = new Date(d1.getFullYear(), d1.getMonth() + 1, 0);
      var offsetX = (dateOffset(d1) + dateOffset(d2) + $scope.cellSize) / 2;
      return 'translate(' + offsetX + ',' + offsetY + ')';
    })
    .attr('class', 'monthLabel')
    .style('text-anchor', 'middle')
    .style('alignment-baseline', 'central')
    .text(d3.time.format('%b'));

  // Container body
  var offsetY = 0.5*$scope.cellSize + $scope.topMargin;

  container = container.append('g')
      .attr('transform', 'translate(1,' + offsetY + ')');

  drawDayCells($scope, container);
  drawMonthBorders($scope, container);

  return container;
};

var generatePopoverBody = function($scope, d) {
  if (d > $scope.now) {
    return "Date in the future<br/>We know you'll work out hard!";
  }
  return '...';
};

var installWorkoutPopover = function(sel, $scope) {
  var dayId = function(d) {
    return 'day-' + d.getTime();
  };
  sel.attr('id', dayId)
    .on('mouseover', function(d) {
      $('#' + dayId(d)).popover({
	title: d3.time.format('%A, %d %B %Y')(d),
	container: '#vis-calendar',
	content: generatePopoverBody($scope, d),
	placement: d.getMonth() < 6 ? 'right' : 'left',
	html: true
      }).popover('show');
    })
    .on('mouseout', function(d) {
      $('#' + dayId(d)).popover('hide');
    });
};

var drawDayCells = function($scope, container) {
  var getWeekday = d3.time.format('%w');
  var getWeek = d3.time.format('%U');

  container.selectAll('.day')
    .data(function(d) {
      return d3.time.days(
	  new Date(d, 0, 1),
	  new Date(d + 1, 0, 1));
    })
  .enter()
    .append('rect')
    .attr('class', 'day')
    .classed('future', function(d) { return d > $scope.now; })
    .attr('width', $scope.cellSize)
    .attr('height', $scope.cellSize)
    .attr('x', function(d) { return $scope.cellSize * getWeek(d); })
    .attr('y', function(d) { return $scope.cellSize * getWeekday(d); })
    .call(installWorkoutPopover, $scope);
};

var drawMonthBorders = function($scope, container) {
  var getWeekday = d3.time.format('%w');
  var getWeek = d3.time.format('%U');
  var cellSize = $scope.cellSize;

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
  };

  // Draw month borders
  var enter = container.selectAll('.month')
    .data(function(d) {
      return d3.time.months(
	  new Date(d, 0, 1),
	  new Date(d + 1, 0, 1));
    })
  .enter()
    .append('path')
    .attr('class', 'month')
    .attr('d', monthPath);
};

var drawWorkouts = function($scope, container, data) {
  var getWeekday = d3.time.format('%w');
  var getWeek = d3.time.format('%U');

  var xScale = d3.scale.linear()
      .domain([0, 52])
      .rangeRound([0, $scope.cellSize*52]);
  var yScale = d3.scale.linear()
      .domain([0, 6])
      .rangeRound([0, $scope.cellSize*6]);
  var sizeScale = d3.scale.sqrt()
      .domain([0, d3.max(data, function(d) { return d.value; })])
      .rangeRound([0, $scope.cellSize - 1]);

  var workouts = container.selectAll('.workout')
      .data(data, function(d, i) { return d.key; });

  workouts.exit().transition()
      .duration(TRANSITIONS_DURATION)
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
      .delay(workouts.exit().empty() ? 0 : TRANSITIONS_DURATION)
      .duration(TRANSITIONS_DURATION)
      .attr('width', function(d) { return sizeScale(d.value); })
      .attr('height', function(d) { return sizeScale(d.value); })
      .attr('x', function(d) { return xScale(+getWeek(d.day) + 0.5) - sizeScale(d.value)/2; })
      .attr('y', function(d) { return yScale(+getWeekday(d.day) + 0.5) - sizeScale(d.value)/2; })
      .style('fill', function(d) { return d.color; });
};

var drawSportIcons = function($scope, data) {
  var sportIconWidth = 55;  // img width + border + padding
  var millisecPerDay = 24 * 60 * 60 * 1000;
  var numDays = ($scope.now.getFullYear() == $scope.year) ?
      ($scope.now - new Date($scope.year.id, 0, 1)) / millisecPerDay : 365;
  var numWeeks = numDays / 7;

  var getType = function() { return $scope.displayType.id; };
  var showAvg = $scope.sportSummaryType.id == 'weeklyAvg';
  // Make icons white when sport colors don't show up in the chart.

  var leftPosition = function(d, i) {
    return +(i * sportIconWidth) + 'px';
  };
  var setMetricBackgroundColor = function(id, bgColor) {
    d3.selectAll('#sport-summary .data span.' + id).style('background-color', bgColor);
  };

  // Displaying all sport metrics
  _.each(['icon', 'sessions', 'time', 'distance', 'elevation'], function(metric) {
    var hasData = function(s) {
      switch (metric) {
	case 'icon': return true;
	case 'sessions': return s.num > 0;
	case 'time': return s.time > 0;
	case 'distance': return s.distance > 0;
	case 'elevation': return s.elevation > 0;
	default: throw new Error('Uknown metric: ' + metric);
      };
    };
    var sportBackgroundColor = function(s) {
      var hasData = function() {
    	switch (getType()) {
  	  case 'hr': // fall-through
	  case 'time': return s.time > 0;
	  case 'distance': // fall-through
	  case 'pace': return s.distance > 0;
	  case 'elevation': return s.elevation > 0;
	}
      };
      if (getType() == 'time' || getType() == 'distance') { // sport colors matter
        if (hasData()) {
  	  return s.color; // sport with data
	} else {
	  return '#ccc'; // inactive sport
	}
      } else if (hasData()) {
	return '#f5f5f5';
      } else {
	return '#ccc';
      }
    };

    // selection
    var eltType = metric == 'icon' ? 'img' : 'span';
    var entries = d3.select('#sport-summary .' + metric + ' .data')
      .selectAll(eltType)
      .data(data, function(s) { return s.id; });

    // enter
    var enter = entries.enter()
      .append(eltType)
      .attr('class', function(s) { return s.id })
      .classed('value', metric != 'icon')
      .classed('hasData', hasData)
      .style('left', leftPosition)
      .style('opacity', 0);
    if (metric == 'icon') {
      enter
        .attr('src', function(s) {
          // TODO(koper) Change it into a property on sport.
          return 'img/sport/' + s.id + '.png';
        })
        .attr('rel', 'tooltip')
        .attr('data-toggle', 'tooltip')
        .attr('data-title', function(s) { return s.name; })
        .on('mouseover', function(s) {
          setMetricBackgroundColor(s.id, sportBackgroundColor(s));
         })
        .on('mouseout', function(s) {
          setMetricBackgroundColor(s.id,  'transparent');
        });
    };

    // exit
    entries.exit().transition()
      .duration(TRANSITIONS_DURATION)
      .style('opacity', 0)
      .remove();

    // update
    var update = entries.transition()
      .delay(entries.exit().empty() ? 0 : TRANSITIONS_DURATION)
      .duration(TRANSITIONS_DURATION)
      .style('left', leftPosition)
      .style('opacity', metric == 'icon' ? 0.8 : 1.0)
      .text(' ');
    if (metric == 'icon') {
      update.style('background-color', sportBackgroundColor);
    };
    var dataUpdate = update.filter(hasData);
    switch (metric) {
      case 'icon':
        break;
      case 'sessions':
        dataUpdate.text(function(s) {
	  if (showAvg) {
	    return (s.num / numWeeks).toFixed(1);
	  } else {
	    return s.num;
	  }
	});
        break;
      case 'time':
        dataUpdate.text(function(s) {
   	  var h = s.time / 3600;
 	  if (showAvg) {
	    return (h / numWeeks).toFixed(1);
	  } else {
	    return h.toFixed(0);
	  }
	});
        break;
      case 'distance':
        dataUpdate.text(function(s) {
   	  var km = s.distance / 1000;
 	  if (showAvg) {
	    return (km / numWeeks).toFixed(1);
	  } else {
	    return km.toFixed(0);
	  }
	});
        break;
      case 'elevation':
        dataUpdate.text(function(s) { return ''; });
        break;
      default:
        throw new Error('Unknown metric: ' + metric);
    };
  });
};

var drawData = function($scope, DataProvider, container) {
  // Prepare the data.
  var data = filterData($scope, DataProvider);

  // Draw workouts data.
  var workoutData = computeWorkoutData($scope, DataProvider, data);
  drawWorkouts($scope, container, workoutData);

  // Draw sport summaries.
  var totals = computeTotals($scope, DataProvider, data);
  drawSportIcons($scope, totals);
};
