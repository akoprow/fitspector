
// --------------------------------------------------------------------------------------------------------
// ---------------------------------------------- Constants -----------------------------------------------
// --------------------------------------------------------------------------------------------------------

// Constants
var TRANSITIONS_DURATION = 400;
var TOP_MARGIN = 15;

var LEGEND_LABEL_SIZE = 10;
var LEGEND_PADDING = 10;
var LEGEND_MIN_CELL_SIZE = 35;

// --------------------------------------------------------------------------------------------------------
// -------------------------------------- Global page modifications ---------------------------------------
// --------------------------------------------------------------------------------------------------------

// TODO(koper) Use Angular-UI instead? Use d3-bootstrap?
$('body').tooltip({
  selector: '[rel=tooltip]'
});

// --------------------------------------------------------------------------------------------------------
// ------------------------------------------- Angular modules --------------------------------------------
// --------------------------------------------------------------------------------------------------------

var services = angular.module('fitspector.services', []);
var directives = angular.module('fitspector.directives', []);
var filters = angular.module('fitspector.filters', []);
var app = angular.module('fitspector', ['fitspector.directives', 'fitspector.services', 'fitspector.filters']);

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
    xcs: { name: 'Cross-country skiing', color: '#cca6ac' },
    swim: { name: 'Swimming', color: '#ffad46' },
    row: { name: 'Rowing', color: '#d06b64' },
    bik: { name: 'Cycling', color: '#fa573c' },
    ten: { name: 'Tennis', color: '#9fe1e7' }
  };
  var workoutsData = computeData(workouts);

  return {
    sports: sports,
    allSports: _.map(_.keys(sports), function(sport) {
      return _.extend(sports[sport], { id: sport });
    }),
    // TODO(koper) This is messy; I think the format returned by the two functions is different... improve the API
    getDayWorkouts: function(day) {
      return workoutsData[day];
    },
    getAllWorkouts: function() {
      var workouts = _.pairs(workoutsData);
      return _.map(workouts, function(d) { return { day: d[1][0].day, exercises: d[1] }; });
    }
  };
});

var computeData = function(workouts) {
  var sum = function(d) {
    return _.reduce(d, function(x, y) { return x + y; }, 0);
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
      totalDistance: sum(d.pace),
      note: d.note,
      avgHR: d.hrAvg
    };
  };
  var data = _.map(workouts, makeWorkout);
  data = _.groupBy(data, "day");
  return data;
};

// --------------------------------------------------------------------------------------------------------
// ------------------------------------------- iconSport directive ----------------------------------------
// --------------------------------------------------------------------------------------------------------

directives.directive('iconSport', ['DataProvider', function(DataProvider) {
  return {
    restrict: 'E',
    replace: true,
    template: '<img ng-src="img/sport/{{sport.id}}.png" class="sport-icon"' +
	' rel="tooltip" data-toggle="tooltip" data-title="{{sport.name}}"' +
	' style="background-color: {{sport.color}}"></img>',
    scope: {
      sportId: '='
    },
    link: function($scope, elem, attrs) {
      $scope.sport = DataProvider.sports[$scope.sportId];
    }
  };
}]);

// --------------------------------------------------------------------------------------------------------
// --------------------------------------------- icon directive -------------------------------------------
// --------------------------------------------------------------------------------------------------------

directives.directive('icon', function() {
  var getIconId = function(type) {
    var icons = {
      time: 'time',
      distance: 'road',
      hr: 'heart',
      pace: 'fast-forward',
      elevation: 'chevron-up',
      climbs: 'signal',
      sessions: 'ok'
    };
    return icons[type];
  };

  return {
    restrict: 'E',
    template: '<i class="{{cssClass}} icon-{{iconId}}"></i>',
    scope: {
      type: '@',
      variant: '@'
    },
    link: function($scope, elem, attrs) {
      $scope.cssClass = 'icon';
      if (attrs.variant == 'white') {
	$scope.cssClass = 'icon-white';
      }
      attrs.$observe('type', function(type) {
	$scope.iconId = getIconId(type);
      });
    }
  };
});

// --------------------------------------------------------------------------------------------------------
// ---------------------------------------------- time filter --------------------------------------------
// --------------------------------------------------------------------------------------------------------

// TODO(koper) Check if this can be hidden inside the filter, which should be used instead of this function.
var timeFilter = function(sec) {
  // TODO(koper) There must be a better way to do this conversion...
  var h = Math.floor(sec / 3600);
  var m = Math.floor((sec - h*3600) / 60);
  return h + ':' + (m < 10 ? '0' : '') + m;
};

filters.filter('time', function() {
  return timeFilter;
});

// --------------------------------------------------------------------------------------------------------
// -------------------------------------------- distance filter -------------------------------------------
// --------------------------------------------------------------------------------------------------------

filters.filter('distance', function() {
  return function(meters) {
    var km = meters / 1000;
    return km.toFixed(1);
  };
});

// --------------------------------------------------------------------------------------------------------
// ----------------------------------------------- pace filter --------------------------------------------
// --------------------------------------------------------------------------------------------------------

filters.filter('pace', function() {
  return function(secPerKm) {
    // TODO(koper) There must be a better way to do this conversion...
    var m = Math.floor(secPerKm / 60);
    var s = Math.floor(secPerKm - m * 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  };
});

// --------------------------------------------------------------------------------------------------------
// ------------------------------------------ time metric directive ---------------------------------------
// --------------------------------------------------------------------------------------------------------

directives.directive('metricTime', function() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'views/metric-time.html',
    scope: {
      time: '='
    },
    link: function($scope) {
      $scope.$watch('time', function(s) {
	$scope.metricValue = s;
        $scope.show = s;
      });
    }
  };
});

// --------------------------------------------------------------------------------------------------------
// ---------------------------------------- distance metric directive -------------------------------------
// --------------------------------------------------------------------------------------------------------

directives.directive('metricDistance', function() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'views/metric-distance.html',
    scope: {
      distance: '='
    },
    link: function($scope) {
      $scope.$watch('distance', function(m) {
        $scope.show = m;
	$scope.metricValue = m;
      });
    }
  };
});

// --------------------------------------------------------------------------------------------------------
// ------------------------------------------ pace metric directive ---------------------------------------
// --------------------------------------------------------------------------------------------------------

directives.directive('metricPace', function() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'views/metric-pace.html',
    scope: {
      time: '=',
      distance: '='
    },
    link: function($scope) {
      var recompute = function() {
        var sec = $scope.time;
        var m = $scope.distance;
        $scope.show = sec && m;
        if ($scope.show) {
          $scope.metricValue = sec / (m / 1000);
        }
      };
      $scope.$watch('time', function() {
        recompute();
      });
      $scope.$watch('distance', function() {
        recompute();
      });
    }
  };
});

// --------------------------------------------------------------------------------------------------------
// ------------------------------------------- HR metric directive ----------------------------------------
// --------------------------------------------------------------------------------------------------------

directives.directive('metricHr', function() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'views/metric-hr.html',
    scope: {
      hr: '='
    },
    link: function($scope) {
      $scope.$watch('hr', function(bpm) {
        $scope.show = bpm;
        $scope.metricValue = bpm.toFixed(0);
      });
    }
  };
});

// --------------------------------------------------------------------------------------------------------
// ------------------------------------------- workout directive ------------------------------------------
// --------------------------------------------------------------------------------------------------------

directives.directive('workout', ['DataProvider', function(DataProvider) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'views/workout.html',
    scope: {
      model: '='
    }
  };
}]);

// --------------------------------------------------------------------------------------------------------
// ------------------------------------------ workouts directive ------------------------------------------
// --------------------------------------------------------------------------------------------------------

directives.directive('workouts', ['DataProvider', function(DataProvider) {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: 'views/workouts.html',
    scope: {
      day: '='
    },
    link: function($scope, $elem, $attrs) {
      $scope.$watch('day', function(day) {
	$scope.workouts = DataProvider.getDayWorkouts(day);
      });
    }
  };
}]);

// --------------------------------------------------------------------------------------------------------
// ---------------------------------------- VisCalendar controller ----------------------------------------
// --------------------------------------------------------------------------------------------------------

// TODO(koper) Move all the drawing into a directive.

// Calendar controller
app.controller('VisCalendar', ['$scope', 'DataProvider', function($scope, DataProvider) {

  // TODO(koper) This should be changed to now in the final product (+ possibly remove property)
  var now = new Date(2013, 7, 25);

  var hrZoneColors = ['#ccc', "#fee5d9","#fcbba1","#fc9272","#fb6a4a","#de2d26","#a50f15"];
  // TODO(koper) Fix those desc
  var hrZoneDesc = ['Unknown', '<60%', '>60%', '>70%', '>75%', '>80%', '>90%'];

  var paceZoneColors = ['#ccc', "#f2f0f7","#dadaeb","#bcbddc","#9e9ac8","#756bb1","#54278f"];
  // TODO(koper) Fix those desc
  var paceZoneDesc = ['Unknown', '>6:05', '>5:45', '>5:15', '>4:45', '>4:15', '<4:15'];

  // ---------------------------------------------
  // --- Handling visualization parameter changes
  // ---------------------------------------------

  // --- selectedDay ---

  $scope.selectedDay = null;
  $scope.selectedDayText = function() {
    var day = $scope.selectedDay;
    if (day) {
      return d3.time.format('%A, %d %B %Y')(day);
    }
    return null;
  };

  // --- sportFilter ---

  $scope.sportFilter = { id: 'all' };
  $scope.setSportFilter = function(sport) {
    $scope.sportFilter = sport;
  };

  // --- displayType ---

  $scope.allDisplayTypes = [
    {
      id: 'time',
      name: 'Time'
    },
    {
      id: 'distance',
      name: 'Distance'
    },
    {
      id: 'hr',
      name: 'HR zones'
    },
    {
      id: 'pace',
      name: 'Pace zones'
    },
    {
      id: 'climbs',
      name: 'Climb categories'
    }

  ];

  $scope.displayType = $scope.allDisplayTypes[0];

  $scope.setDisplayType = function(type) {
    if (type.id != 'climbs') {
      $scope.displayType = type;
    }
  };

  // --- sportSummaryType ---

  $scope.allSportSummaryTypes = [
    {id: 'weeklyAvg', name: 'Weekly avg.'},
    {id: 'total', name: 'Total'}
  ];

  $scope.sportSummaryType = $scope.allSportSummaryTypes[0];

  $scope.setSportSummaryType = function(type) {
    $scope.sportSummaryType = type;
  };

  // --- year ---

  // TODO(koper) Change into year selection component and get rid of literals.
  $scope.time = { year: 2013 };
  $scope.disablePrevYear = function() {
    return $scope.time.year <= 2012;
  };
  $scope.disableNextYear = function() {
    return $scope.time.year >= 2013;
  };
  $scope.currentYear = function() {
    $scope.time.year = 2013;
  };
  $scope.nextYear = function() {
    if (!$scope.disableNextYear()) {
      $scope.selectedDay = null;
      $scope.time.year++;
    }
  };
  $scope.prevYear = function() {
    if (!$scope.disablePrevYear()) {
      $scope.selectedDay = null;
      $scope.time.year--;
    }
  };

  // --------------
  // --- Help text
  // --------------

  $scope.help = function() {
    var tour = {
      id: "tour",
      steps: [
        {
          title: 'Analysis type',
          content: 'Start by choosing the metric that you want to analyze. The calendar will show boxes corresponding to workouts, with their size and color determined as follows:<ul>' +
            '<li><strong>Time</strong>: colors correspond to sports and box size corresponds to time.' +
            '<li><strong>Distance</strong>: colors correspond to sports and box size corresponds to distance.' +
            '<li><strong>HR zones</strong>: colors correspond to HR zones and box size corresponds to time.' +
            '<li><strong>Pace zones</strong>: colors correspond to pace zones and box size corresponds to distance.' +
            '<li><strong>Climb categories</strong>: colors correspond to climb categories and box size corresponds to distance.' +
            '</ul>',
          target: '.analysis-type-selection .btn',
          width: 500,
          placement: 'bottom'
        },
        {
          title: 'Year',
          content: 'Select a year to analyze',
          target: '.year-selection .btn',
          placement: 'bottom'
        },
        {
          title: 'Workout visualization',
          content: '<p>This is the calendar view of the given year.</p><p>Every cell corresponds to one day.</p><p>Click any of the cells to see all workouts for the given day.</p>',
          target: '#vis-calendar',
          placement: 'top'
        },
        {
          title: 'Sport summaries',
          content: '<p>Here you can see all sports with annual totals.</p><p>Click on any sport to restrict analysis only to this workout type.</p>',
          target: '#sport-summary',
          placement: 'bottom'
        },
        {
          title: 'Legend',
          content: 'In the legend you can see what the box colors and sizes in the visualization correspond to.',
          target: '#legend .legend-entry',
          placement: 'bottom'
        }
      ]
    };
    hopscotch.startTour(tour);
  };

  $scope.getSizeLegendLabel = function() {
    switch ($scope.displayType.id) {
    case 'time':
    case 'hr':
      return 'Workout time (hours):';
    case 'distance':
    case 'pace':
    case 'elevation':
      return 'Workout distance (km):';
    default:
      throw new Error('Unknown displayType: ' + $scope.displayType.id);
    }
  };

  $scope.getColorLegendLabel = function() {
    switch ($scope.displayType.id) {
    case 'time':
    case 'distance':
      return 'Colors correspond to sports (see left)';
    case 'hr':
      return 'HR zones (% HR max):';
    case 'pace':
      return 'Pace zones (min/km):';
    case 'elevation':
      return 'Elevation zones (grade %):';
    default:
      throw new Error('Unknown displayType: ' + $scope.displayType.id);
    }
  };

  // -----------------------------------------
  // --- Drawing functions
  // -----------------------------------------

  var cellSize = 18;
  var topMargin = TOP_MARGIN;

  var dailyDataBySports = function(d) {
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
        color: DataProvider.sports[e.exerciseType].color
      };
    });
  };

  var addZones = function(z1, z2) {
    var data = _.zip(z1, z2);
    return _.map(data, function(values) {
      return _.reduce(values, function(v1, v2) { return v1 + v2; });
    });
  };

  var dailyDataByZones = function(d) {
    var type = $scope.displayType.id;
    var zones = [0, 0, 0, 0, 0, 0, 0];
    var colors;
    switch (type) {
    case 'hr':
      colors = hrZoneColors;
      break;
    case 'pace':
      colors = paceZoneColors;
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
      };
    });
  };

  var filterData = function() {
    var year = $scope.time.year;
    var sport = $scope.sportFilter.id;
    var workouts = DataProvider.getAllWorkouts();

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

  var computeWorkoutData = function(workouts) {
    var type = $scope.displayType.id;
    // Compute visual representation.
    var data = _.map(workouts, function(d) {
      switch (type) {
      case 'time':
      case 'distance':
        return dailyDataBySports(d);
      case 'hr':
      case 'pace':
        return dailyDataByZones(d);
      default: throw Error('Unknown grouping: ' + type);
      }
    });

    // Join all data into a single array and reverse it.
    var res = [];
    data = res.concat.apply(res, data);
    return data.reverse();
  };

  var computeTotals = function(data) {
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
    data = _.map(sportTotals, function(value, key) {
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

  var svgContainer = function() {
    return d3.select('#vis-calendar').selectAll('svg');
  };

  var gridContainer = function() {
    return svgContainer().selectAll('g.grid');
  };

  var drawCalendar = function() {
    var windowWidth = $('#vis-calendar').width();
    cellSize = Math.floor((windowWidth - 2) / 53);

    var width = 2 + cellSize * 53;
    var height = topMargin + (cellSize + 1) * 8;
    var getWeek = d3.time.format('%U');

    // Main container
    var container = svgContainer().data([$scope.time.year]);
    var gridY = 0.5 * cellSize + topMargin;
    var enter = container
      .enter()
        .append('svg')
          .attr('class', 'year')
        .append('g')
          .attr('class', 'grid')
          .attr('transform', 'translate(1,' + gridY + ')');
    // update container size
    container.transition(TRANSITIONS_DURATION)
        .attr('width', width)
        .attr('height', height);
    enter.append('g').attr('class', 'dayCellsContainer');
    enter.append('g').attr('class', 'workoutsContainer');
    enter.append('g').attr('class', 'monthBordersContainer');

    // Monthly labels
    var labelY = topMargin / 2;
    var labels = container.selectAll('.monthLabel')
      .data(function(year) {
        return d3.time.months(
          new Date(year, 0, 1),
          new Date(year + 1, 0, 1));
      }, function(d) {
        return d.getMonth();
      });

    labels.enter()
      .append('text')
      .attr('class', 'monthLabel')
      .style('text-anchor', 'middle')
      .style('alignment-baseline', 'central')
      .attr('x', -100)
      .attr('y', labelY)
      .text(d3.time.format('%b'));

    labels.transition()
      .delay(TRANSITIONS_DURATION)
      .duration(TRANSITIONS_DURATION)
      .attr('x', function(d1) {
        var dateOffset = function(d) {
          var week = +getWeek(d);
          return week * cellSize;
        };
        var d2 = new Date(d1.getFullYear(), d1.getMonth() + 1, 0);
        return (dateOffset(d1) + dateOffset(d2) + cellSize) / 2;
      });
  };

  var redrawSelectedDay = function(d) {
    // ...
  };

  var drawDayCells = function() {
    var getWeekday = d3.time.format('%w');
    var getWeek = d3.time.format('%U');
    var posX = function(d) {
      return cellSize * getWeek(d);
    };
    var posY = function(d) {
      return cellSize * getWeekday(d);
    };

    var grid = gridContainer().selectAll('.dayCellsContainer');
    var cells = grid.selectAll('.day')
      .data(d3.time.days(
        new Date($scope.time.year, 0, 1),
        new Date($scope.time.year + 1, 0, 1)
      ), function(d) { // we key by cell position
        return posX(d) + '-' + posY(d);
      });

    cells.enter()
      .append('rect')
      .attr('class', 'day');

    cells.exit().transition(TRANSITIONS_DURATION)
      .delay(TRANSITIONS_DURATION)
      .attr('width', 0)
      .attr('height', 0)
      .remove();

    cells
      .on('click', function(d) {
        var elt = this;
        $scope.$apply(function() {
          $scope.selectedDay = d;
          redrawSelectedDay(d);
        });
      })
      .transition()
        .duration(TRANSITIONS_DURATION)
        .delay(TRANSITIONS_DURATION)
        .attr('x', posX)
        .attr('y', posY)
        .attr('width', cellSize)
        .attr('height', cellSize)
        .style('fill', function(d) { return d > now ? '#f5f5f5' : '#fff'; });
  };

  var drawMonthBorders = function() {
    var getWeekday = d3.time.format('%w');
    var getWeek = d3.time.format('%U');

    var monthPath = function(t0) {
      var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0);
      var d0 = +getWeekday(t0);
      var w0 = +getWeek(t0);
      var d1 = +getWeekday(t1);
      var w1 = +getWeek(t1);
      var c = cellSize;
      return 'M' + (w0 + 1) * c + ',' + d0 * c +
        'H' + w0 * c + 'V' + 7 * c +
        'H' + w1 * c + 'V' + (d1 + 1) * c +
        'H' + (w1 + 1) * c + 'V' + 0 +
        'H' + (w0 + 1) * c + 'Z';
    };

    // Draw month borders
    var borders = gridContainer().selectAll('.monthBordersContainer')
      .selectAll('path.month')
      .data(d3.time.months(
        new Date($scope.time.year, 0, 1),
        new Date($scope.time.year + 1, 0, 1)));

    borders.enter()
      .append('path')
      .attr('class', 'month');

    borders.transition()
      .duration(TRANSITIONS_DURATION)
      .delay(TRANSITIONS_DURATION)
      .attr('d', monthPath);
  };

  var getMaxDataValue = function() {
    var fullData = computeWorkoutData(DataProvider.getAllWorkouts());
    return d3.max(fullData, function(d) { return d.value; });
  };

  var getSizeScale = function(cellSize) {
    // TODO(koper) This is inefficient; we should just cache sizeScale for a given display type.
    return d3.scale.sqrt()
      .domain([0, getMaxDataValue()])
      .rangeRound([0, cellSize - 1]);
  };

  var drawWorkouts = function(fullRedraw, data) {
    var getWeekday = d3.time.format('%w');
    var getWeek = d3.time.format('%U');

    var xScale = d3.scale.linear()
          .domain([0, 52])
          .rangeRound([0, cellSize * 52]);
    var yScale = d3.scale.linear()
          .domain([0, 6])
          .rangeRound([0, cellSize * 6]);
    var sizeScale = getSizeScale(cellSize);

    var workouts = gridContainer()
          .selectAll('.workoutsContainer')
          .selectAll('.workout')
          .data(data, function(d) { return d.key; });

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
      .delay(TRANSITIONS_DURATION * (fullRedraw ? 2 : (workouts.exit().empty() ? 0 : 1)))
      .duration(TRANSITIONS_DURATION)
      .attr('width', function(d) { return sizeScale(d.value); })
      .attr('height', function(d) { return sizeScale(d.value); })
      .attr('x', function(d) { return xScale(+getWeek(d.day) + 0.5) - sizeScale(d.value)/2; })
      .attr('y', function(d) { return yScale(+getWeekday(d.day) + 0.5) - sizeScale(d.value)/2; })
      .style('fill', function(d) { return d.color; });
  };

  var drawSportIcons = function(fullRedraw, data) {
    var sportIconWidth = 55;  // img width + border + padding
    var millisecPerDay = 24 * 60 * 60 * 1000;
    var numDays = (now.getFullYear() == $scope.time.year) ?
          (now - new Date($scope.time.year, 0, 1)) / millisecPerDay : 365;
    var numWeeks = numDays / 7;

    var getType = function() { return $scope.displayType.id; };
    var showAvg = $scope.sportSummaryType.id == 'weeklyAvg';
    // Make icons white when sport colors don't show up in the chart.

    var leftPosition = function(d, i) {
      return +(i * sportIconWidth) + 'px';
    };
    var setMetricBackgroundColor = function(id, bgColor) {
      d3.selectAll('#sport-summary .data span.sport-' + id).style('background-color', bgColor);
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
        }
      };
      var sportBackgroundColor = function(s) {
        var hasData = function() {
          switch (getType()) {
          case 'hr': // fall-through
          case 'time': return s.time > 0;
          case 'distance': // fall-through
          case 'pace': return s.distance > 0;
          case 'elevation': return s.elevation > 0;
          default: throw new Error('Unknown type: ' + getType());
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
            .attr('class', function(s) { return 'sport-' + s.id; })
            .classed('value', metric != 'icon')
            .classed('hasData', hasData)
            .style('left', leftPosition)
            .style('opacity', 0);
      if (metric == 'icon') {
        // TODO(koper) Use directive instead.
        enter
          .attr('src', function(s) {
            // TODO(koper) Change it into a property on sport, which should be changed into a proper class.
            return 'img/sport/' + s.id + '.png';
          })
          .attr('rel', 'tooltip')
          .classed('sport-icon', true)
          .attr('data-toggle', 'tooltip')
          .attr('data-title', function(s) { return s.name; })
          .on('mouseover', function(s) {
            setMetricBackgroundColor(s.id, sportBackgroundColor(s));
          })
          .on('mouseout', function(s) {
            setMetricBackgroundColor(s.id,  'transparent');
          });
      }

      // exit
      entries.exit().transition()
        .delay(fullRedraw ? TRANSITIONS_DURATION : 0)
        .duration(TRANSITIONS_DURATION)
        .style('opacity', 0)
        .remove();

      // update
      var update = entries.transition()
            .duration(TRANSITIONS_DURATION * (fullRedraw ? 3 : 1))
            .style('left', leftPosition)
            .style('opacity', metric == 'icon' ? 0.8 : 1.0)
            .text(' ');
      if (metric == 'icon') {
        update.style('background-color', sportBackgroundColor);
      }
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
          if (showAvg) {
            return timeFilter(s.time / numWeeks);
          } else {
            return (s.time / 3600).toFixed(0);
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
      }
    });
  };

  var drawLegend = function(legendId, params) {
    var data = params.data;
    var mode = params.mode;
    var cramped = mode == 'zones' && cellSize < LEGEND_MIN_CELL_SIZE;

    var marginTop = LEGEND_LABEL_SIZE * (cramped ? 2 : 1);
    // Text size for the description
    d3.select('#legend-' + legendId + ' .text')
      .style('line-height', cellSize + 'px')
      .style('margin-top', marginTop + 'px');

    var container = d3.select('#legend-' + legendId + ' svg');
    container
      .attr('width', cellSize * data.length + 1 + LEGEND_PADDING * 2)
      .attr('height', cellSize + 1 + marginTop);

    // Draw boxes, marks in them and labels on top
    // TODO(koper) Somewhat share the positioning logic with drawing workout boxes. Perhaps use a layout? Or auxiliary functions.
    var sizeScale = getSizeScale(cellSize);
    _.each(['box', 'mark', 'desc'], function(type) {
      var boxSize = function(d) {
        switch (type) {
        case 'mark': return mode == 'zones' ? cellSize - 1 : sizeScale(d.val);
        case 'box': return cellSize;
        case 'desc': return cellSize;
        default: throw new Error('Unknown element: ' + type);
        }
      };
      var items = container
         .selectAll('.' + type)
         .data(data);
      items.enter()
        .append(type == 'desc' ? 'text' : 'rect')
        .attr('class', type);
      var update = items.transition(TRANSITIONS_DURATION);
      update
        .attr('x', function(d, i) {
          switch (type) {
            case 'mark': return LEGEND_PADDING + cellSize * (i + 0.5) - boxSize(d)/2;
            case 'box': return LEGEND_PADDING + cellSize * i;
            case 'desc': return LEGEND_PADDING + cellSize * (i + 0.5);
            default: throw new Error('Unknown element: ' + type);
          }
        })
        .attr('y', function(d, i) {
          switch (type) {
            case 'mark': return marginTop + (cellSize - boxSize(d)) / 2;
            case 'box': return marginTop;
            case 'desc':
              // if not much space for labels we need to put them in two rows.
              if (cramped && i % 2 == 0) {
                return marginTop - LEGEND_LABEL_SIZE - 2;
              } else {
                return marginTop - 2;
              }
            default: throw new Error('Unknown element: ' + type);
          }
        });
      if (type == 'mark' && mode == 'zones') {
        update.style('fill', function(d) { return d.color; });
      }
      if (type == 'desc') {
        update.text(function(d, i) {
          return d.text;
        });
      } else {
        update
          .attr('width', boxSize)
          .attr('height', boxSize);
      }
      items.exit()
        .remove();
    });
  };

  // TODO(koper) Make ranges in this function dependent on data.
  var getLegendSizeParams = function() {
    switch ($scope.displayType.id) {
    case 'time':
    case 'hr':
      // 1h, 2h, ... 9h, 10h
      var h = 3600;
      return {
        mode: 'time',
        data: _.map(
          _.range(1, 11, 1),
          function(v) {
            return {
              val: 3600 * v,
              text: v + 'h'
            };
          })
      };
    case 'distance':
    case 'pace':
      // 10km, 20km, ... 70km
      var km = 1000;
      return {
        mode: 'distance',
        data: _.map(
          _.range(10, 80, 10),
          function(v) {
            return {
              val: km * v,
              text: v,
              fullText: v + ' km'
            };
          })
      };
    default:
      throw new Error('Unknown mode: ' + $scope.displayType.id);
    };
  };

  // TODO(koper) Make ranges in this function dependent on data.
  var getLegendColorParams = function() {
    switch ($scope.displayType.id) {
    case 'time':
    case 'distance':
      return {
        mode: 'text',
        data: []
      };
    case 'hr':
      return {
        mode: 'zones',
        data: _.map(
          _.range(0, 7),
          function(v) {
            return {
              val: v,
              text: hrZoneDesc[v],
              color: hrZoneColors[v]
            };
          })
      };
    case 'pace':
      return {
        mode: 'zones',
        data: _.map(
          _.range(0, 7),
          function(v) {
            return {
              val: v,
              text: paceZoneDesc[v],
              fullText: paceZoneDesc[v] + ' min/km',
              color: paceZoneColors[v]
            };
          })
      };
    default:
      throw new Error('Unknown mode: ' + $scope.displayType.id);
    };
  };

  var drawLegends = function() {
    drawLegend('size', getLegendSizeParams());
    drawLegend('color', getLegendColorParams());
  };

  var redraw = function(fullRedraw) {
    // Draw the container.
    if (fullRedraw) {
      drawCalendar();
      drawDayCells();
      drawMonthBorders();
    };

    // Prepare the data.
    var data = filterData();
    var workoutData = computeWorkoutData(data, $scope.displayType.id);

    // Draw workouts.
    drawWorkouts(fullRedraw, workoutData);

    // Draw sport summaries.
    var totals = computeTotals(data);
    drawSportIcons(fullRedraw, totals);

    // Draw legends
    drawLegends();
  };

  redraw(true);

  // --------------------------------------------
  // --- Handling redrawing on data model change
  // --------------------------------------------

  var handleRedraw = function(nv, ov, fullRedraw) {
    if (nv !== ov) {
      redraw(fullRedraw);
    }
  };

  $scope.$watch('time.year', function(nv, ov) { handleRedraw(nv, ov, true); });
  $scope.$watch('sportFilter', handleRedraw);
  $scope.$watch('displayType', handleRedraw);
  $scope.$watch('sportSummaryType', handleRedraw);
  $(window).resize(function() {
    redraw(true);
  });

}]);
