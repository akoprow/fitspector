// --------------------------------------------------------------------------------------------------------
// ---------------------------------------- Custom starter page JS ----------------------------------------
// --------------------------------------------------------------------------------------------------------

function selectPledge(num) {
  $('input:radio[name=pledgeLevel]')[num-1].checked = true;
  for (var i = 1; i <= 5; i++) {
    $('.pledge.level' + i).removeClass('alert-success').addClass('alert-warning');
  }
  $('.pledge.level' + num).addClass('alert-success');
};

$(document).ready(function() {
  var now = new Date();
  var end = Date.parse('September 8, 2013');
  var daysleft = Math.floor((end - now) / 1000 / 60 / 60 / 24);
  $('#daysleft').text(daysleft);
});

$(document).ready(function() {
  $('.goToNewsletter').on('click', function() {
    var props = { scrollTop: $('#mce-EMAIL-alert').offset().top - ($(window).height()/2) };
    var options = {
      duration: 1000
    };
    $('html, body').animate(props, options);
    return false;
  });
});

// --------------------------------------------------------------------------------------------------------
// ------------------------------------------ Google Analytics --------------------------------------------
// --------------------------------------------------------------------------------------------------------
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-267768-13']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
 (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
 m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-267768-13', 'fitspector.com');
ga('send', 'pageview');

// --------------------------------------------------------------------------------------------------------
// ---------------------------------------------- Constants -----------------------------------------------
// --------------------------------------------------------------------------------------------------------

// Constants
var MAX_DISTINCT_SPORTS = 4;
var TRANSITIONS_DURATION = 400;
var TOP_MARGIN = 15;

var LEGEND_LABEL_SIZE = 10;
var LEGEND_PADDING = 14;
var LEGEND_MIN_CELL_SIZE = 35;

var SPORT_ICON_WIDTH = 46;  // img width + border + padding

// --------------------------------------------------------------------------------------------------------
// -------------------------------------- Global page modifications ---------------------------------------
// --------------------------------------------------------------------------------------------------------

// TODO(koper) Use Angular-UI instead? Use d3-bootstrap?
$('body').tooltip({
  selector: '[rel=tooltip]'
});
(function($) {
  $(window).load(function(){
    $('#vis-calendar').mCustomScrollbar({
      horizontalScroll: true,
      theme: 'light'
    });
  });
})(jQuery);

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

  $scope.sportFilter = 'all';

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
  var modifiedYear = function() {
    $scope.selectedDay = null;
    $scope.sportFilter = 'all';
  };
  $scope.nextYear = function() {
    if (!$scope.disableNextYear()) {
      $scope.time.year++;
      modifiedYear();
    }
  };
  $scope.prevYear = function() {
    if (!$scope.disablePrevYear()) {
      $scope.time.year--;
      modifiedYear();
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
          title: 'Workouts\' data visualization',
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
          placement: 'top'
        },
        {
          title: 'Workout details',
          content: 'Click on any day in the calendar and the details of the workouts for that day will appear here.',
          target: '#selected-day-workouts',
          placement: 'top'
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

  var dailyDataBySports = function(d, activeSports) {
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
        color: _.contains(activeSports, e.exerciseType) ? DataProvider.sports[e.exerciseType].color : '#ccc'
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
    var sport = $scope.sportFilter;
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

  var computeWorkoutData = function(workouts, activeSports) {
    var type = $scope.displayType.id;
    // Compute visual representation.
    var data = _.map(workouts, function(d) {
      switch (type) {
      case 'time':
      case 'distance':
        return dailyDataBySports(d, activeSports);
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
    data = data.reverse();

    return {
      data: data,
      activeSports: _.map(_.first(data, MAX_DISTINCT_SPORTS), function(d) { return d.id; })
    };
  };

  var svgContainer = function() {
    return d3.select('#vis-calendar').selectAll('svg');
  };

  var gridContainer = function() {
    return svgContainer().selectAll('g.grid');
  };

  var drawCalendar = function() {
    var windowWidth = $('#vis-calendar').width();
    cellSize = Math.floor((windowWidth - 2) / 53) * 2;

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
          var bottom = $('#selected-day-workouts').offset().top + 210; // TODO(koper) Magic number
          if ($(window).scrollTop() + $(window).height() < bottom) {
            $('html, body').animate({
              scrollTop: bottom - $(window).height()
            });
          }
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

  var drawWorkouts = function(fullRedraw, data, activeSports) {
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

  var drawSportIcons = function(fullRedraw, data, activeSports) {
    var millisecPerDay = 24 * 60 * 60 * 1000;
    var numDays = (now.getFullYear() == $scope.time.year) ?
          (now - new Date($scope.time.year, 0, 1)) / millisecPerDay : 365;
    var numWeeks = numDays / 7;

    var getType = function() { return $scope.displayType.id; };
    var showAvg = $scope.sportSummaryType.id == 'weeklyAvg';
    // Make icons white when sport colors don't show up in the chart.

    var leftPosition = function(d, i) {
      return +(i * SPORT_ICON_WIDTH) + 'px';
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
          if (hasData() & _.contains(activeSports, s.id)) {
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
          .on('click', function(s) {
            $scope.$apply(function() {
              if ($scope.sportFilter == 'all') {
                $scope.sportFilter = s.id;
              } else {
                $scope.sportFilter = 'all';
              }
            });
          })
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
    var totals = computeTotals(data);
    var workoutData = computeWorkoutData(data, totals.activeSports);

    // Draw workouts.
    drawWorkouts(fullRedraw, workoutData);

    // Draw sport summaries.
    drawSportIcons(fullRedraw, totals.data, totals.activeSports);

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

// --------------------------------------------------------------------------------------------------------
// ------------------------------------ jQuery custom content scroller ------------------------------------
// --------------------------------------------------------------------------------------------------------
/*
== malihu jquery custom scrollbars plugin ==
version: 2.8.2
author: malihu (http://manos.malihu.gr)
plugin home: http://manos.malihu.gr/jquery-custom-content-scroller
*/

/*
Copyright 2010-2013 Manos Malihutsakis

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with this program.  If not, see http://www.gnu.org/licenses/lgpl.html.
*/
(function($){
	/*plugin script*/
	var methods={
		init:function(options){
			var defaults={
				set_width:false, /*optional element width: boolean, pixels, percentage*/
				set_height:false, /*optional element height: boolean, pixels, percentage*/
				horizontalScroll:false, /*scroll horizontally: boolean*/
				scrollInertia:950, /*scrolling inertia: integer (milliseconds)*/
				mouseWheel:true, /*mousewheel support: boolean*/
				mouseWheelPixels:"auto", /*mousewheel pixels amount: integer, "auto"*/
				autoDraggerLength:true, /*auto-adjust scrollbar dragger length: boolean*/
				autoHideScrollbar:false, /*auto-hide scrollbar when idle*/
				snapAmount:null, /* optional element always snaps to a multiple of this number in pixels */
				snapOffset:0, /* when snapping, snap with this number in pixels as an offset */
				scrollButtons:{ /*scroll buttons*/
					enable:false, /*scroll buttons support: boolean*/
					scrollType:"continuous", /*scroll buttons scrolling type: "continuous", "pixels"*/
					scrollSpeed:"auto", /*scroll buttons continuous scrolling speed: integer, "auto"*/
					scrollAmount:40 /*scroll buttons pixels scroll amount: integer (pixels)*/
				},
				advanced:{
					updateOnBrowserResize:true, /*update scrollbars on browser resize (for layouts based on percentages): boolean*/
					updateOnContentResize:false, /*auto-update scrollbars on content resize (for dynamic content): boolean*/
					autoExpandHorizontalScroll:false, /*auto-expand width for horizontal scrolling: boolean*/
					autoScrollOnFocus:true, /*auto-scroll on focused elements: boolean*/
					normalizeMouseWheelDelta:false /*normalize mouse-wheel delta (-1/1)*/
				},
				contentTouchScroll:true, /*scrolling by touch-swipe content: boolean*/
				callbacks:{
					onScrollStart:function(){}, /*user custom callback function on scroll start event*/
					onScroll:function(){}, /*user custom callback function on scroll event*/
					onTotalScroll:function(){}, /*user custom callback function on scroll end reached event*/
					onTotalScrollBack:function(){}, /*user custom callback function on scroll begin reached event*/
					onTotalScrollOffset:0, /*scroll end reached offset: integer (pixels)*/
					onTotalScrollBackOffset:0, /*scroll begin reached offset: integer (pixels)*/
					whileScrolling:function(){} /*user custom callback function on scrolling event*/
				},
				theme:"light" /*"light", "dark", "light-2", "dark-2", "light-thick", "dark-thick", "light-thin", "dark-thin"*/
			},
			options=$.extend(true,defaults,options);
			return this.each(function(){
				var $this=$(this);
				/*set element width/height, create markup for custom scrollbars, add classes*/
				if(options.set_width){
					$this.css("width",options.set_width);
				}
				if(options.set_height){
					$this.css("height",options.set_height);
				}
				if(!$(document).data("mCustomScrollbar-index")){
					$(document).data("mCustomScrollbar-index","1");
				}else{
					var mCustomScrollbarIndex=parseInt($(document).data("mCustomScrollbar-index"));
					$(document).data("mCustomScrollbar-index",mCustomScrollbarIndex+1);
				}
				$this.wrapInner("<div class='mCustomScrollBox"+" mCS-"+options.theme+"' id='mCSB_"+$(document).data("mCustomScrollbar-index")+"' style='position:relative; height:100%; overflow:hidden; max-width:100%;' />").addClass("mCustomScrollbar _mCS_"+$(document).data("mCustomScrollbar-index"));
				var mCustomScrollBox=$this.children(".mCustomScrollBox");
				if(options.horizontalScroll){
					mCustomScrollBox.addClass("mCSB_horizontal").wrapInner("<div class='mCSB_h_wrapper' style='position:relative; left:0; width:999999px;' />");
					var mCSB_h_wrapper=mCustomScrollBox.children(".mCSB_h_wrapper");
					mCSB_h_wrapper.wrapInner("<div class='mCSB_container' style='position:absolute; left:0;' />").children(".mCSB_container").css({"width":mCSB_h_wrapper.children().outerWidth(),"position":"relative"}).unwrap();
				}else{
					mCustomScrollBox.wrapInner("<div class='mCSB_container' style='position:relative; top:0;' />");
				}
				var mCSB_container=mCustomScrollBox.children(".mCSB_container");
				if($.support.touch){
					mCSB_container.addClass("mCS_touch");
				}
				mCSB_container.after("<div class='mCSB_scrollTools' style='position:absolute;'><div class='mCSB_draggerContainer'><div class='mCSB_dragger' style='position:absolute;' oncontextmenu='return false;'><div class='mCSB_dragger_bar' style='position:relative;'></div></div><div class='mCSB_draggerRail'></div></div></div>");
				var mCSB_scrollTools=mCustomScrollBox.children(".mCSB_scrollTools"),
					mCSB_draggerContainer=mCSB_scrollTools.children(".mCSB_draggerContainer"),
					mCSB_dragger=mCSB_draggerContainer.children(".mCSB_dragger");
				if(options.horizontalScroll){
					mCSB_dragger.data("minDraggerWidth",mCSB_dragger.width());
				}else{
					mCSB_dragger.data("minDraggerHeight",mCSB_dragger.height());
				}
				if(options.scrollButtons.enable){
					if(options.horizontalScroll){
						mCSB_scrollTools.prepend("<a class='mCSB_buttonLeft' oncontextmenu='return false;'></a>").append("<a class='mCSB_buttonRight' oncontextmenu='return false;'></a>");
					}else{
						mCSB_scrollTools.prepend("<a class='mCSB_buttonUp' oncontextmenu='return false;'></a>").append("<a class='mCSB_buttonDown' oncontextmenu='return false;'></a>");
					}
				}
				/*mCustomScrollBox scrollTop and scrollLeft is always 0 to prevent browser focus scrolling*/
				mCustomScrollBox.bind("scroll",function(){
					if(!$this.is(".mCS_disabled")){ /*native focus scrolling for disabled scrollbars*/
						mCustomScrollBox.scrollTop(0).scrollLeft(0);
					}
				});
				/*store options, global vars/states, intervals*/
				$this.data({
					/*init state*/
					"mCS_Init":true,
					/*instance index*/
					"mCustomScrollbarIndex":$(document).data("mCustomScrollbar-index"),
					/*option parameters*/
					"horizontalScroll":options.horizontalScroll,
					"scrollInertia":options.scrollInertia,
					"scrollEasing":"mcsEaseOut",
					"mouseWheel":options.mouseWheel,
					"mouseWheelPixels":options.mouseWheelPixels,
					"autoDraggerLength":options.autoDraggerLength,
					"autoHideScrollbar":options.autoHideScrollbar,
					"snapAmount":options.snapAmount,
					"snapOffset":options.snapOffset,
					"scrollButtons_enable":options.scrollButtons.enable,
					"scrollButtons_scrollType":options.scrollButtons.scrollType,
					"scrollButtons_scrollSpeed":options.scrollButtons.scrollSpeed,
					"scrollButtons_scrollAmount":options.scrollButtons.scrollAmount,
					"autoExpandHorizontalScroll":options.advanced.autoExpandHorizontalScroll,
					"autoScrollOnFocus":options.advanced.autoScrollOnFocus,
					"normalizeMouseWheelDelta":options.advanced.normalizeMouseWheelDelta,
					"contentTouchScroll":options.contentTouchScroll,
					"onScrollStart_Callback":options.callbacks.onScrollStart,
					"onScroll_Callback":options.callbacks.onScroll,
					"onTotalScroll_Callback":options.callbacks.onTotalScroll,
					"onTotalScrollBack_Callback":options.callbacks.onTotalScrollBack,
					"onTotalScroll_Offset":options.callbacks.onTotalScrollOffset,
					"onTotalScrollBack_Offset":options.callbacks.onTotalScrollBackOffset,
					"whileScrolling_Callback":options.callbacks.whileScrolling,
					/*events binding state*/
					"bindEvent_scrollbar_drag":false,
					"bindEvent_content_touch":false,
					"bindEvent_scrollbar_click":false,
					"bindEvent_mousewheel":false,
					"bindEvent_buttonsContinuous_y":false,
					"bindEvent_buttonsContinuous_x":false,
					"bindEvent_buttonsPixels_y":false,
					"bindEvent_buttonsPixels_x":false,
					"bindEvent_focusin":false,
					"bindEvent_autoHideScrollbar":false,
					/*buttons intervals*/
					"mCSB_buttonScrollRight":false,
					"mCSB_buttonScrollLeft":false,
					"mCSB_buttonScrollDown":false,
					"mCSB_buttonScrollUp":false
				});
				/*max-width/max-height*/
				if(options.horizontalScroll){
					if($this.css("max-width")!=="none"){
						if(!options.advanced.updateOnContentResize){ /*needs updateOnContentResize*/
							options.advanced.updateOnContentResize=true;
						}
					}
				}else{
					if($this.css("max-height")!=="none"){
						var percentage=false,maxHeight=parseInt($this.css("max-height"));
						if($this.css("max-height").indexOf("%")>=0){
							percentage=maxHeight,
							maxHeight=$this.parent().height()*percentage/100;
						}
						$this.css("overflow","hidden");
						mCustomScrollBox.css("max-height",maxHeight);
					}
				}
				$this.mCustomScrollbar("update");
				/*window resize fn (for layouts based on percentages)*/
				if(options.advanced.updateOnBrowserResize){
					var mCSB_resizeTimeout,currWinWidth=$(window).width(),currWinHeight=$(window).height();
					$(window).bind("resize."+$this.data("mCustomScrollbarIndex"),function(){
						if(mCSB_resizeTimeout){
							clearTimeout(mCSB_resizeTimeout);
						}
						mCSB_resizeTimeout=setTimeout(function(){
							if(!$this.is(".mCS_disabled") && !$this.is(".mCS_destroyed")){
								var winWidth=$(window).width(),winHeight=$(window).height();
								if(currWinWidth!==winWidth || currWinHeight!==winHeight){ /*ie8 fix*/
									if($this.css("max-height")!=="none" && percentage){
										mCustomScrollBox.css("max-height",$this.parent().height()*percentage/100);
									}
									$this.mCustomScrollbar("update");
									currWinWidth=winWidth; currWinHeight=winHeight;
								}
							}
						},150);
					});
				}
				/*content resize fn (for dynamically generated content)*/
				if(options.advanced.updateOnContentResize){
					var mCSB_onContentResize;
					if(options.horizontalScroll){
						var mCSB_containerOldSize=mCSB_container.outerWidth();
					}else{
						var mCSB_containerOldSize=mCSB_container.outerHeight();
					}
					mCSB_onContentResize=setInterval(function(){
						if(options.horizontalScroll){
							if(options.advanced.autoExpandHorizontalScroll){
								mCSB_container.css({"position":"absolute","width":"auto"}).wrap("<div class='mCSB_h_wrapper' style='position:relative; left:0; width:999999px;' />").css({"width":mCSB_container.outerWidth(),"position":"relative"}).unwrap();
							}
							var mCSB_containerNewSize=mCSB_container.outerWidth();
						}else{
							var mCSB_containerNewSize=mCSB_container.outerHeight();
						}
						if(mCSB_containerNewSize!=mCSB_containerOldSize){
							$this.mCustomScrollbar("update");
							mCSB_containerOldSize=mCSB_containerNewSize;
						}
					},300);
				}
			});
		},
		update:function(){
			var $this=$(this),
				mCustomScrollBox=$this.children(".mCustomScrollBox"),
				mCSB_container=mCustomScrollBox.children(".mCSB_container");
			mCSB_container.removeClass("mCS_no_scrollbar");
			$this.removeClass("mCS_disabled mCS_destroyed");
			mCustomScrollBox.scrollTop(0).scrollLeft(0); /*reset scrollTop/scrollLeft to prevent browser focus scrolling*/
			var mCSB_scrollTools=mCustomScrollBox.children(".mCSB_scrollTools"),
				mCSB_draggerContainer=mCSB_scrollTools.children(".mCSB_draggerContainer"),
				mCSB_dragger=mCSB_draggerContainer.children(".mCSB_dragger");
			if($this.data("horizontalScroll")){
				var mCSB_buttonLeft=mCSB_scrollTools.children(".mCSB_buttonLeft"),
					mCSB_buttonRight=mCSB_scrollTools.children(".mCSB_buttonRight"),
					mCustomScrollBoxW=mCustomScrollBox.width();
				if($this.data("autoExpandHorizontalScroll")){
					mCSB_container.css({"position":"absolute","width":"auto"}).wrap("<div class='mCSB_h_wrapper' style='position:relative; left:0; width:999999px;' />").css({"width":mCSB_container.outerWidth(),"position":"relative"}).unwrap();
				}
				var mCSB_containerW=mCSB_container.outerWidth();
			}else{
				var mCSB_buttonUp=mCSB_scrollTools.children(".mCSB_buttonUp"),
					mCSB_buttonDown=mCSB_scrollTools.children(".mCSB_buttonDown"),
					mCustomScrollBoxH=mCustomScrollBox.height(),
					mCSB_containerH=mCSB_container.outerHeight();
			}
			if(mCSB_containerH>mCustomScrollBoxH && !$this.data("horizontalScroll")){ /*content needs vertical scrolling*/
				mCSB_scrollTools.css("display","block");
				var mCSB_draggerContainerH=mCSB_draggerContainer.height();
				/*auto adjust scrollbar dragger length analogous to content*/
				if($this.data("autoDraggerLength")){
					var draggerH=Math.round(mCustomScrollBoxH/mCSB_containerH*mCSB_draggerContainerH),
						minDraggerH=mCSB_dragger.data("minDraggerHeight");
					if(draggerH<=minDraggerH){ /*min dragger height*/
						mCSB_dragger.css({"height":minDraggerH});
					}else if(draggerH>=mCSB_draggerContainerH-10){ /*max dragger height*/
						var mCSB_draggerContainerMaxH=mCSB_draggerContainerH-10;
						mCSB_dragger.css({"height":mCSB_draggerContainerMaxH});
					}else{
						mCSB_dragger.css({"height":draggerH});
					}
					mCSB_dragger.children(".mCSB_dragger_bar").css({"line-height":mCSB_dragger.height()+"px"});
				}
				var mCSB_draggerH=mCSB_dragger.height(),
				/*calculate and store scroll amount, add scrolling*/
					scrollAmount=(mCSB_containerH-mCustomScrollBoxH)/(mCSB_draggerContainerH-mCSB_draggerH);
				$this.data("scrollAmount",scrollAmount).mCustomScrollbar("scrolling",mCustomScrollBox,mCSB_container,mCSB_draggerContainer,mCSB_dragger,mCSB_buttonUp,mCSB_buttonDown,mCSB_buttonLeft,mCSB_buttonRight);
				/*scroll*/
				var mCSB_containerP=Math.abs(mCSB_container.position().top);
				$this.mCustomScrollbar("scrollTo",mCSB_containerP,{scrollInertia:0,trigger:"internal"});
			}else if(mCSB_containerW>mCustomScrollBoxW && $this.data("horizontalScroll")){ /*content needs horizontal scrolling*/
				mCSB_scrollTools.css("display","block");
				var mCSB_draggerContainerW=mCSB_draggerContainer.width();
				/*auto adjust scrollbar dragger length analogous to content*/
				if($this.data("autoDraggerLength")){
					var draggerW=Math.round(mCustomScrollBoxW/mCSB_containerW*mCSB_draggerContainerW),
						minDraggerW=mCSB_dragger.data("minDraggerWidth");
					if(draggerW<=minDraggerW){ /*min dragger height*/
						mCSB_dragger.css({"width":minDraggerW});
					}else if(draggerW>=mCSB_draggerContainerW-10){ /*max dragger height*/
						var mCSB_draggerContainerMaxW=mCSB_draggerContainerW-10;
						mCSB_dragger.css({"width":mCSB_draggerContainerMaxW});
					}else{
						mCSB_dragger.css({"width":draggerW});
					}
				}
				var mCSB_draggerW=mCSB_dragger.width(),
				/*calculate and store scroll amount, add scrolling*/
					scrollAmount=(mCSB_containerW-mCustomScrollBoxW)/(mCSB_draggerContainerW-mCSB_draggerW);
				$this.data("scrollAmount",scrollAmount).mCustomScrollbar("scrolling",mCustomScrollBox,mCSB_container,mCSB_draggerContainer,mCSB_dragger,mCSB_buttonUp,mCSB_buttonDown,mCSB_buttonLeft,mCSB_buttonRight);
				/*scroll*/
				var mCSB_containerP=Math.abs(mCSB_container.position().left);
				$this.mCustomScrollbar("scrollTo",mCSB_containerP,{scrollInertia:0,trigger:"internal"});
			}else{ /*content does not need scrolling*/
				/*unbind events, reset content position, hide scrollbars, remove classes*/
				mCustomScrollBox.unbind("mousewheel focusin");
				if($this.data("horizontalScroll")){
					mCSB_dragger.add(mCSB_container).css("left",0);
				}else{
					mCSB_dragger.add(mCSB_container).css("top",0);
				}
				mCSB_scrollTools.css("display","none");
				mCSB_container.addClass("mCS_no_scrollbar");
				$this.data({"bindEvent_mousewheel":false,"bindEvent_focusin":false});
			}
		},
		scrolling:function(mCustomScrollBox,mCSB_container,mCSB_draggerContainer,mCSB_dragger,mCSB_buttonUp,mCSB_buttonDown,mCSB_buttonLeft,mCSB_buttonRight){
			var $this=$(this);
			/*scrollbar drag scrolling*/
			if(!$this.data("bindEvent_scrollbar_drag")){
				var mCSB_draggerDragY,mCSB_draggerDragX;
				if($.support.msPointer){ /*MSPointer*/
					mCSB_dragger.bind("MSPointerDown",function(e){
						e.preventDefault();
						$this.data({"on_drag":true}); mCSB_dragger.addClass("mCSB_dragger_onDrag");
						var elem=$(this),
							elemOffset=elem.offset(),
							x=e.originalEvent.pageX-elemOffset.left,
							y=e.originalEvent.pageY-elemOffset.top;
						if(x<elem.width() && x>0 && y<elem.height() && y>0){
							mCSB_draggerDragY=y;
							mCSB_draggerDragX=x;
						}
					});
					$(document).bind("MSPointerMove."+$this.data("mCustomScrollbarIndex"),function(e){
						e.preventDefault();
						if($this.data("on_drag")){
							var elem=mCSB_dragger,
								elemOffset=elem.offset(),
								x=e.originalEvent.pageX-elemOffset.left,
								y=e.originalEvent.pageY-elemOffset.top;
							scrollbarDrag(mCSB_draggerDragY,mCSB_draggerDragX,y,x);
						}
					}).bind("MSPointerUp."+$this.data("mCustomScrollbarIndex"),function(e){
						$this.data({"on_drag":false}); mCSB_dragger.removeClass("mCSB_dragger_onDrag");
					});
				}else{ /*mouse/touch*/
					mCSB_dragger.bind("mousedown touchstart",function(e){
						e.preventDefault(); e.stopImmediatePropagation();
						var	elem=$(this),elemOffset=elem.offset(),x,y;
						if(e.type==="touchstart"){
							var touch=e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
							x=touch.pageX-elemOffset.left; y=touch.pageY-elemOffset.top;
						}else{
							$this.data({"on_drag":true}); mCSB_dragger.addClass("mCSB_dragger_onDrag");
							x=e.pageX-elemOffset.left; y=e.pageY-elemOffset.top;
						}
						if(x<elem.width() && x>0 && y<elem.height() && y>0){
							mCSB_draggerDragY=y; mCSB_draggerDragX=x;
						}
					}).bind("touchmove",function(e){
						e.preventDefault(); e.stopImmediatePropagation();
						var touch=e.originalEvent.touches[0] || e.originalEvent.changedTouches[0],
							elem=$(this),
							elemOffset=elem.offset(),
							x=touch.pageX-elemOffset.left,
							y=touch.pageY-elemOffset.top;
						scrollbarDrag(mCSB_draggerDragY,mCSB_draggerDragX,y,x);
					});
					$(document).bind("mousemove."+$this.data("mCustomScrollbarIndex"),function(e){
						if($this.data("on_drag")){
							var elem=mCSB_dragger,
								elemOffset=elem.offset(),
								x=e.pageX-elemOffset.left,
								y=e.pageY-elemOffset.top;
							scrollbarDrag(mCSB_draggerDragY,mCSB_draggerDragX,y,x);
						}
					}).bind("mouseup."+$this.data("mCustomScrollbarIndex"),function(e){
						$this.data({"on_drag":false}); mCSB_dragger.removeClass("mCSB_dragger_onDrag");
					});
				}
				$this.data({"bindEvent_scrollbar_drag":true});
			}
			function scrollbarDrag(mCSB_draggerDragY,mCSB_draggerDragX,y,x){
				if($this.data("horizontalScroll")){
					$this.mCustomScrollbar("scrollTo",(mCSB_dragger.position().left-(mCSB_draggerDragX))+x,{moveDragger:true,trigger:"internal"});
				}else{
					$this.mCustomScrollbar("scrollTo",(mCSB_dragger.position().top-(mCSB_draggerDragY))+y,{moveDragger:true,trigger:"internal"});
				}
			}
			/*content touch-drag*/
			if($.support.touch && $this.data("contentTouchScroll")){
				if(!$this.data("bindEvent_content_touch")){
					var touch,
						elem,elemOffset,y,x,mCSB_containerTouchY,mCSB_containerTouchX;
					mCSB_container.bind("touchstart",function(e){
						e.stopImmediatePropagation();
						touch=e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
						elem=$(this);
						elemOffset=elem.offset();
						x=touch.pageX-elemOffset.left;
						y=touch.pageY-elemOffset.top;
						mCSB_containerTouchY=y;
						mCSB_containerTouchX=x;
					});
					mCSB_container.bind("touchmove",function(e){
						e.preventDefault(); e.stopImmediatePropagation();
						touch=e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
						elem=$(this).parent();
						elemOffset=elem.offset();
						x=touch.pageX-elemOffset.left;
						y=touch.pageY-elemOffset.top;
						if($this.data("horizontalScroll")){
							$this.mCustomScrollbar("scrollTo",mCSB_containerTouchX-x,{trigger:"internal"});
						}else{
							$this.mCustomScrollbar("scrollTo",mCSB_containerTouchY-y,{trigger:"internal"});
						}
					});
				}
			}
			/*dragger rail click scrolling*/
			if(!$this.data("bindEvent_scrollbar_click")){
				mCSB_draggerContainer.bind("click",function(e){
					var scrollToPos=(e.pageY-mCSB_draggerContainer.offset().top)*$this.data("scrollAmount"),target=$(e.target);
					if($this.data("horizontalScroll")){
						scrollToPos=(e.pageX-mCSB_draggerContainer.offset().left)*$this.data("scrollAmount");
					}
					if(target.hasClass("mCSB_draggerContainer") || target.hasClass("mCSB_draggerRail")){
						$this.mCustomScrollbar("scrollTo",scrollToPos,{trigger:"internal",scrollEasing:"draggerRailEase"});
					}
				});
				$this.data({"bindEvent_scrollbar_click":true});
			}
			/*mousewheel scrolling*/
			if($this.data("mouseWheel")){
				if(!$this.data("bindEvent_mousewheel")){
					mCustomScrollBox.bind("mousewheel",function(e,delta){
						var scrollTo,mouseWheelPixels=$this.data("mouseWheelPixels"),absPos=Math.abs(mCSB_container.position().top),
							draggerPos=mCSB_dragger.position().top,limit=mCSB_draggerContainer.height()-mCSB_dragger.height();
						if($this.data("normalizeMouseWheelDelta")){
							if(delta<0){delta=-1;}else{delta=1;}
						}
						if(mouseWheelPixels==="auto"){
							mouseWheelPixels=100+Math.round($this.data("scrollAmount")/2);
						}
						if($this.data("horizontalScroll")){
							draggerPos=mCSB_dragger.position().left;
							limit=mCSB_draggerContainer.width()-mCSB_dragger.width();
							absPos=Math.abs(mCSB_container.position().left);
						}
						if((delta>0 && draggerPos!==0) || (delta<0 && draggerPos!==limit)){e.preventDefault(); e.stopImmediatePropagation();}
						scrollTo=absPos-(delta*mouseWheelPixels);
						$this.mCustomScrollbar("scrollTo",scrollTo,{trigger:"internal"});
					});
					$this.data({"bindEvent_mousewheel":true});
				}
			}
			/*buttons scrolling*/
			if($this.data("scrollButtons_enable")){
				if($this.data("scrollButtons_scrollType")==="pixels"){ /*scroll by pixels*/
					if($this.data("horizontalScroll")){
						mCSB_buttonRight.add(mCSB_buttonLeft).unbind("mousedown touchstart MSPointerDown mouseup MSPointerUp mouseout MSPointerOut touchend",mCSB_buttonRight_stop,mCSB_buttonLeft_stop);
						$this.data({"bindEvent_buttonsContinuous_x":false});
						if(!$this.data("bindEvent_buttonsPixels_x")){
							/*scroll right*/
							mCSB_buttonRight.bind("click",function(e){
								e.preventDefault();
								PixelsScrollTo(Math.abs(mCSB_container.position().left)+$this.data("scrollButtons_scrollAmount"));
							});
							/*scroll left*/
							mCSB_buttonLeft.bind("click",function(e){
								e.preventDefault();
								PixelsScrollTo(Math.abs(mCSB_container.position().left)-$this.data("scrollButtons_scrollAmount"));
							});
							$this.data({"bindEvent_buttonsPixels_x":true});
						}
					}else{
						mCSB_buttonDown.add(mCSB_buttonUp).unbind("mousedown touchstart MSPointerDown mouseup MSPointerUp mouseout MSPointerOut touchend",mCSB_buttonRight_stop,mCSB_buttonLeft_stop);
						$this.data({"bindEvent_buttonsContinuous_y":false});
						if(!$this.data("bindEvent_buttonsPixels_y")){
							/*scroll down*/
							mCSB_buttonDown.bind("click",function(e){
								e.preventDefault();
								PixelsScrollTo(Math.abs(mCSB_container.position().top)+$this.data("scrollButtons_scrollAmount"));
							});
							/*scroll up*/
							mCSB_buttonUp.bind("click",function(e){
								e.preventDefault();
								PixelsScrollTo(Math.abs(mCSB_container.position().top)-$this.data("scrollButtons_scrollAmount"));
							});
							$this.data({"bindEvent_buttonsPixels_y":true});
						}
					}
					function PixelsScrollTo(to){
						if(!mCSB_dragger.data("preventAction")){
							mCSB_dragger.data("preventAction",true);
							$this.mCustomScrollbar("scrollTo",to,{trigger:"internal"});
						}
					}
				}else{ /*continuous scrolling*/
					if($this.data("horizontalScroll")){
						mCSB_buttonRight.add(mCSB_buttonLeft).unbind("click");
						$this.data({"bindEvent_buttonsPixels_x":false});
						if(!$this.data("bindEvent_buttonsContinuous_x")){
							/*scroll right*/
							mCSB_buttonRight.bind("mousedown touchstart MSPointerDown",function(e){
								e.preventDefault();
								var scrollButtonsSpeed=ScrollButtonsSpeed();
								$this.data({"mCSB_buttonScrollRight":setInterval(function(){
									$this.mCustomScrollbar("scrollTo",Math.abs(mCSB_container.position().left)+scrollButtonsSpeed,{trigger:"internal",scrollEasing:"easeOutCirc"});
								},17)});
							});
							var mCSB_buttonRight_stop=function(e){
								e.preventDefault(); clearInterval($this.data("mCSB_buttonScrollRight"));
							}
							mCSB_buttonRight.bind("mouseup touchend MSPointerUp mouseout MSPointerOut",mCSB_buttonRight_stop);
							/*scroll left*/
							mCSB_buttonLeft.bind("mousedown touchstart MSPointerDown",function(e){
								e.preventDefault();
								var scrollButtonsSpeed=ScrollButtonsSpeed();
								$this.data({"mCSB_buttonScrollLeft":setInterval(function(){
									$this.mCustomScrollbar("scrollTo",Math.abs(mCSB_container.position().left)-scrollButtonsSpeed,{trigger:"internal",scrollEasing:"easeOutCirc"});
								},17)});
							});
							var mCSB_buttonLeft_stop=function(e){
								e.preventDefault(); clearInterval($this.data("mCSB_buttonScrollLeft"));
							}
							mCSB_buttonLeft.bind("mouseup touchend MSPointerUp mouseout MSPointerOut",mCSB_buttonLeft_stop);
							$this.data({"bindEvent_buttonsContinuous_x":true});
						}
					}else{
						mCSB_buttonDown.add(mCSB_buttonUp).unbind("click");
						$this.data({"bindEvent_buttonsPixels_y":false});
						if(!$this.data("bindEvent_buttonsContinuous_y")){
							/*scroll down*/
							mCSB_buttonDown.bind("mousedown touchstart MSPointerDown",function(e){
								e.preventDefault();
								var scrollButtonsSpeed=ScrollButtonsSpeed();
								$this.data({"mCSB_buttonScrollDown":setInterval(function(){
									$this.mCustomScrollbar("scrollTo",Math.abs(mCSB_container.position().top)+scrollButtonsSpeed,{trigger:"internal",scrollEasing:"easeOutCirc"});
								},17)});
							});
							var mCSB_buttonDown_stop=function(e){
								e.preventDefault(); clearInterval($this.data("mCSB_buttonScrollDown"));
							}
							mCSB_buttonDown.bind("mouseup touchend MSPointerUp mouseout MSPointerOut",mCSB_buttonDown_stop);
							/*scroll up*/
							mCSB_buttonUp.bind("mousedown touchstart MSPointerDown",function(e){
								e.preventDefault();
								var scrollButtonsSpeed=ScrollButtonsSpeed();
								$this.data({"mCSB_buttonScrollUp":setInterval(function(){
									$this.mCustomScrollbar("scrollTo",Math.abs(mCSB_container.position().top)-scrollButtonsSpeed,{trigger:"internal",scrollEasing:"easeOutCirc"});
								},17)});
							});
							var mCSB_buttonUp_stop=function(e){
								e.preventDefault(); clearInterval($this.data("mCSB_buttonScrollUp"));
							}
							mCSB_buttonUp.bind("mouseup touchend MSPointerUp mouseout MSPointerOut",mCSB_buttonUp_stop);
							$this.data({"bindEvent_buttonsContinuous_y":true});
						}
					}
					function ScrollButtonsSpeed(){
						var speed=$this.data("scrollButtons_scrollSpeed");
						if($this.data("scrollButtons_scrollSpeed")==="auto"){
							speed=Math.round(($this.data("scrollInertia")+100)/40);
						}
						return speed;
					}
				}
			}
			/*scrolling on element focus (e.g. via TAB key)*/
			if($this.data("autoScrollOnFocus")){
				if(!$this.data("bindEvent_focusin")){
					mCustomScrollBox.bind("focusin",function(){
						mCustomScrollBox.scrollTop(0).scrollLeft(0);
						var focusedElem=$(document.activeElement);
						if(focusedElem.is("input,textarea,select,button,a[tabindex],area,object")){
							var mCSB_containerPos=mCSB_container.position().top,
								focusedElemPos=focusedElem.position().top,
								visibleLimit=mCustomScrollBox.height()-focusedElem.outerHeight();
							if($this.data("horizontalScroll")){
								mCSB_containerPos=mCSB_container.position().left;
								focusedElemPos=focusedElem.position().left;
								visibleLimit=mCustomScrollBox.width()-focusedElem.outerWidth();
							}
							if(mCSB_containerPos+focusedElemPos<0 || mCSB_containerPos+focusedElemPos>visibleLimit){
								$this.mCustomScrollbar("scrollTo",focusedElemPos,{trigger:"internal"});
							}
						}
					});
					$this.data({"bindEvent_focusin":true});
				}
			}
			/*auto-hide scrollbar*/
			if($this.data("autoHideScrollbar")){
				if(!$this.data("bindEvent_autoHideScrollbar")){
					mCustomScrollBox.bind("mouseenter",function(e){
						mCustomScrollBox.addClass("mCS-mouse-over");
						functions.showScrollbar.call(mCustomScrollBox.children(".mCSB_scrollTools"));
					}).bind("mouseleave touchend",function(e){
						mCustomScrollBox.removeClass("mCS-mouse-over");
						if(e.type==="mouseleave"){functions.hideScrollbar.call(mCustomScrollBox.children(".mCSB_scrollTools"));}
					});
					$this.data({"bindEvent_autoHideScrollbar":true});
				}
			}
		},
		scrollTo:function(scrollTo,options){
			var $this=$(this),
				defaults={
					moveDragger:false,
					trigger:"external",
					callbacks:true,
					scrollInertia:$this.data("scrollInertia"),
					scrollEasing:$this.data("scrollEasing")
				},
				options=$.extend(defaults,options),
				draggerScrollTo,
				mCustomScrollBox=$this.children(".mCustomScrollBox"),
				mCSB_container=mCustomScrollBox.children(".mCSB_container"),
				mCSB_scrollTools=mCustomScrollBox.children(".mCSB_scrollTools"),
				mCSB_draggerContainer=mCSB_scrollTools.children(".mCSB_draggerContainer"),
				mCSB_dragger=mCSB_draggerContainer.children(".mCSB_dragger"),
				contentSpeed=draggerSpeed=options.scrollInertia,
				scrollBeginning,scrollBeginningOffset,totalScroll,totalScrollOffset;
			if(!mCSB_container.hasClass("mCS_no_scrollbar")){
				$this.data({"mCS_trigger":options.trigger});
				if($this.data("mCS_Init")){options.callbacks=false;}
				if(scrollTo || scrollTo===0){
					if(typeof(scrollTo)==="number"){ /*if integer, scroll by number of pixels*/
						if(options.moveDragger){ /*scroll dragger*/
							draggerScrollTo=scrollTo;
							if($this.data("horizontalScroll")){
								scrollTo=mCSB_dragger.position().left*$this.data("scrollAmount");
							}else{
								scrollTo=mCSB_dragger.position().top*$this.data("scrollAmount");
							}
							draggerSpeed=0;
						}else{ /*scroll content by default*/
							draggerScrollTo=scrollTo/$this.data("scrollAmount");
						}
					}else if(typeof(scrollTo)==="string"){ /*if string, scroll by element position*/
						var target;
						if(scrollTo==="top"){ /*scroll to top*/
							target=0;
						}else if(scrollTo==="bottom" && !$this.data("horizontalScroll")){ /*scroll to bottom*/
							target=mCSB_container.outerHeight()-mCustomScrollBox.height();
						}else if(scrollTo==="left"){ /*scroll to left*/
							target=0;
						}else if(scrollTo==="right" && $this.data("horizontalScroll")){ /*scroll to right*/
							target=mCSB_container.outerWidth()-mCustomScrollBox.width();
						}else if(scrollTo==="first"){ /*scroll to first element position*/
							target=$this.find(".mCSB_container").find(":first");
						}else if(scrollTo==="last"){ /*scroll to last element position*/
							target=$this.find(".mCSB_container").find(":last");
						}else{ /*scroll to element position*/
							target=$this.find(scrollTo);
						}
						if(target.length===1){ /*if such unique element exists, scroll to it*/
							if($this.data("horizontalScroll")){
								scrollTo=target.position().left;
							}else{
								scrollTo=target.position().top;
							}
							draggerScrollTo=scrollTo/$this.data("scrollAmount");
						}else{
							draggerScrollTo=scrollTo=target;
						}
					}
					/*scroll to*/
					if($this.data("horizontalScroll")){
						if($this.data("onTotalScrollBack_Offset")){ /*scroll beginning offset*/
							scrollBeginningOffset=-$this.data("onTotalScrollBack_Offset");
						}
						if($this.data("onTotalScroll_Offset")){ /*total scroll offset*/
							totalScrollOffset=mCustomScrollBox.width()-mCSB_container.outerWidth()+$this.data("onTotalScroll_Offset");
						}
						if(draggerScrollTo<0){ /*scroll start position*/
							draggerScrollTo=scrollTo=0; clearInterval($this.data("mCSB_buttonScrollLeft"));
							if(!scrollBeginningOffset){scrollBeginning=true;}
						}else if(draggerScrollTo>=mCSB_draggerContainer.width()-mCSB_dragger.width()){ /*scroll end position*/
							draggerScrollTo=mCSB_draggerContainer.width()-mCSB_dragger.width();
							scrollTo=mCustomScrollBox.width()-mCSB_container.outerWidth(); clearInterval($this.data("mCSB_buttonScrollRight"));
							if(!totalScrollOffset){totalScroll=true;}
						}else{scrollTo=-scrollTo;}
						var snapAmount = $this.data("snapAmount");
						if (snapAmount) {
							scrollTo = Math.round(scrollTo / snapAmount) * snapAmount - $this.data("snapOffset");
						}
						/*scrolling animation*/
						functions.mTweenAxis.call(this,mCSB_dragger[0],"left",Math.round(draggerScrollTo),draggerSpeed,options.scrollEasing);
						functions.mTweenAxis.call(this,mCSB_container[0],"left",Math.round(scrollTo),contentSpeed,options.scrollEasing,{
							onStart:function(){
								if(options.callbacks && !$this.data("mCS_tweenRunning")){callbacks("onScrollStart");}
								if($this.data("autoHideScrollbar")){functions.showScrollbar.call(mCSB_scrollTools);}
							},
							onUpdate:function(){
								if(options.callbacks){callbacks("whileScrolling");}
							},
							onComplete:function(){
								if(options.callbacks){
									callbacks("onScroll");
									if(scrollBeginning || (scrollBeginningOffset && mCSB_container.position().left>=scrollBeginningOffset)){callbacks("onTotalScrollBack");}
									if(totalScroll || (totalScrollOffset && mCSB_container.position().left<=totalScrollOffset)){callbacks("onTotalScroll");}
								}
								mCSB_dragger.data("preventAction",false); $this.data("mCS_tweenRunning",false);
								if($this.data("autoHideScrollbar")){if(!mCustomScrollBox.hasClass("mCS-mouse-over")){functions.hideScrollbar.call(mCSB_scrollTools);}}
							}
						});
					}else{
						if($this.data("onTotalScrollBack_Offset")){ /*scroll beginning offset*/
							scrollBeginningOffset=-$this.data("onTotalScrollBack_Offset");
						}
						if($this.data("onTotalScroll_Offset")){ /*total scroll offset*/
							totalScrollOffset=mCustomScrollBox.height()-mCSB_container.outerHeight()+$this.data("onTotalScroll_Offset");
						}
						if(draggerScrollTo<0){ /*scroll start position*/
							draggerScrollTo=scrollTo=0; clearInterval($this.data("mCSB_buttonScrollUp"));
							if(!scrollBeginningOffset){scrollBeginning=true;}
						}else if(draggerScrollTo>=mCSB_draggerContainer.height()-mCSB_dragger.height()){ /*scroll end position*/
							draggerScrollTo=mCSB_draggerContainer.height()-mCSB_dragger.height();
							scrollTo=mCustomScrollBox.height()-mCSB_container.outerHeight(); clearInterval($this.data("mCSB_buttonScrollDown"));
							if(!totalScrollOffset){totalScroll=true;}
						}else{scrollTo=-scrollTo;}
						var snapAmount = $this.data("snapAmount");
						if (snapAmount) {
							scrollTo = Math.round(scrollTo / snapAmount) * snapAmount - $this.data("snapOffset");
						}
						/*scrolling animation*/
						functions.mTweenAxis.call(this,mCSB_dragger[0],"top",Math.round(draggerScrollTo),draggerSpeed,options.scrollEasing);
						functions.mTweenAxis.call(this,mCSB_container[0],"top",Math.round(scrollTo),contentSpeed,options.scrollEasing,{
							onStart:function(){
								if(options.callbacks && !$this.data("mCS_tweenRunning")){callbacks("onScrollStart");}
								if($this.data("autoHideScrollbar")){functions.showScrollbar.call(mCSB_scrollTools);}
							},
							onUpdate:function(){
								if(options.callbacks){callbacks("whileScrolling");}
							},
							onComplete:function(){
								if(options.callbacks){
									callbacks("onScroll");
									if(scrollBeginning || (scrollBeginningOffset && mCSB_container.position().top>=scrollBeginningOffset)){callbacks("onTotalScrollBack");}
									if(totalScroll || (totalScrollOffset && mCSB_container.position().top<=totalScrollOffset)){callbacks("onTotalScroll");}
								}
								mCSB_dragger.data("preventAction",false); $this.data("mCS_tweenRunning",false);
								if($this.data("autoHideScrollbar")){if(!mCustomScrollBox.hasClass("mCS-mouse-over")){functions.hideScrollbar.call(mCSB_scrollTools);}}
							}
						});
					}
					if($this.data("mCS_Init")){$this.data({"mCS_Init":false});}
				}
			}
			/*callbacks*/
			function callbacks(cb){
				this.mcs={
					top:mCSB_container.position().top,left:mCSB_container.position().left,
					draggerTop:mCSB_dragger.position().top,draggerLeft:mCSB_dragger.position().left,
					topPct:Math.round((100*Math.abs(mCSB_container.position().top))/Math.abs(mCSB_container.outerHeight()-mCustomScrollBox.height())),
					leftPct:Math.round((100*Math.abs(mCSB_container.position().left))/Math.abs(mCSB_container.outerWidth()-mCustomScrollBox.width()))
				};
				switch(cb){
					/*start scrolling callback*/
					case "onScrollStart":
						$this.data("mCS_tweenRunning",true).data("onScrollStart_Callback").call($this,this.mcs);
						break;
					case "whileScrolling":
						$this.data("whileScrolling_Callback").call($this,this.mcs);
						break;
					case "onScroll":
						$this.data("onScroll_Callback").call($this,this.mcs);
						break;
					case "onTotalScrollBack":
						$this.data("onTotalScrollBack_Callback").call($this,this.mcs);
						break;
					case "onTotalScroll":
						$this.data("onTotalScroll_Callback").call($this,this.mcs);
						break;
				}
			}
		},
		stop:function(){
			var $this=$(this),
				mCSB_container=$this.children().children(".mCSB_container"),
				mCSB_dragger=$this.children().children().children().children(".mCSB_dragger");
			functions.mTweenAxisStop.call(this,mCSB_container[0]);
			functions.mTweenAxisStop.call(this,mCSB_dragger[0]);
		},
		disable:function(resetScroll){
			var $this=$(this),
				mCustomScrollBox=$this.children(".mCustomScrollBox"),
				mCSB_container=mCustomScrollBox.children(".mCSB_container"),
				mCSB_scrollTools=mCustomScrollBox.children(".mCSB_scrollTools"),
				mCSB_dragger=mCSB_scrollTools.children().children(".mCSB_dragger");
			mCustomScrollBox.unbind("mousewheel focusin mouseenter mouseleave touchend");
			mCSB_container.unbind("touchstart touchmove")
			if(resetScroll){
				if($this.data("horizontalScroll")){
					mCSB_dragger.add(mCSB_container).css("left",0);
				}else{
					mCSB_dragger.add(mCSB_container).css("top",0);
				}
			}
			mCSB_scrollTools.css("display","none");
			mCSB_container.addClass("mCS_no_scrollbar");
			$this.data({"bindEvent_mousewheel":false,"bindEvent_focusin":false,"bindEvent_content_touch":false,"bindEvent_autoHideScrollbar":false}).addClass("mCS_disabled");
		},
		destroy:function(){
			var $this=$(this);
			$this.removeClass("mCustomScrollbar _mCS_"+$this.data("mCustomScrollbarIndex")).addClass("mCS_destroyed").children().children(".mCSB_container").unwrap().children().unwrap().siblings(".mCSB_scrollTools").remove();
			$(document).unbind("mousemove."+$this.data("mCustomScrollbarIndex")+" mouseup."+$this.data("mCustomScrollbarIndex")+" MSPointerMove."+$this.data("mCustomScrollbarIndex")+" MSPointerUp."+$this.data("mCustomScrollbarIndex"));
			$(window).unbind("resize."+$this.data("mCustomScrollbarIndex"));
		}
	},
	functions={
		/*hide/show scrollbar*/
		showScrollbar:function(){
			this.stop().animate({opacity:1},"fast");
		},
		hideScrollbar:function(){
			this.stop().animate({opacity:0},"fast");
		},
		/*js animation tween*/
		mTweenAxis:function(el,prop,to,duration,easing,callbacks){
			var callbacks=callbacks || {},
				onStart=callbacks.onStart || function(){},onUpdate=callbacks.onUpdate || function(){},onComplete=callbacks.onComplete || function(){};
			var startTime=_getTime(),_delay,progress=0,from=el.offsetTop,elStyle=el.style;
			if(prop==="left"){from=el.offsetLeft;}
			var diff=to-from;
			_cancelTween();
			_startTween();
			function _getTime(){
				if(window.performance && window.performance.now){
					return window.performance.now();
				}else{
					if(window.performance && window.performance.webkitNow){
						return window.performance.webkitNow();
					}else{
						if(Date.now){return Date.now();}else{return new Date().getTime();}
					}
				}
			}
			function _step(){
				if(!progress){onStart.call();}
				progress=_getTime()-startTime;
				_tween();
				if(progress>=el._time){
					el._time=(progress>el._time) ? progress+_delay-(progress- el._time) : progress+_delay-1;
					if(el._time<progress+1){el._time=progress+1;}
				}
				if(el._time<duration){el._id=_request(_step);}else{onComplete.call();}
			}
			function _tween(){
				if(duration>0){
					el.currVal=_ease(el._time,from,diff,duration,easing);
					elStyle[prop]=Math.round(el.currVal)+"px";
				}else{
					elStyle[prop]=to+"px";
				}
				onUpdate.call();
			}
			function _startTween(){
				_delay=1000/60;
				el._time=progress+_delay;
				_request=(!window.requestAnimationFrame) ? function(f){_tween(); return setTimeout(f,0.01);} : window.requestAnimationFrame;
				el._id=_request(_step);
			}
			function _cancelTween(){
				if(el._id==null){return;}
				if(!window.requestAnimationFrame){clearTimeout(el._id);
				}else{window.cancelAnimationFrame(el._id);}
				el._id=null;
			}
			function _ease(t,b,c,d,type){
				switch(type){
					case "linear":
						return c*t/d + b;
						break;
					case "easeOutQuad":
						t /= d; return -c * t*(t-2) + b;
						break;
					case "easeInOutQuad":
						t /= d/2;
						if (t < 1) return c/2*t*t + b;
						t--;
						return -c/2 * (t*(t-2) - 1) + b;
						break;
					case "easeOutCubic":
						t /= d; t--; return c*(t*t*t + 1) + b;
						break;
					case "easeOutQuart":
						t /= d; t--; return -c * (t*t*t*t - 1) + b;
						break;
					case "easeOutQuint":
						t /= d; t--; return c*(t*t*t*t*t + 1) + b;
						break;
					case "easeOutCirc":
						t /= d; t--; return c * Math.sqrt(1 - t*t) + b;
						break;
					case "easeOutSine":
						return c * Math.sin(t/d * (Math.PI/2)) + b;
						break;
					case "easeOutExpo":
						return c * ( -Math.pow( 2, -10 * t/d ) + 1 ) + b;
						break;
					case "mcsEaseOut":
						var ts=(t/=d)*t,tc=ts*t;
						return b+c*(0.499999999999997*tc*ts + -2.5*ts*ts + 5.5*tc + -6.5*ts + 4*t);
						break;
					case "draggerRailEase":
						t /= d/2;
						if (t < 1) return c/2*t*t*t + b;
						t -= 2;
						return c/2*(t*t*t + 2) + b;
						break;
				}
			}
		},
		/*stop js animation tweens*/
		mTweenAxisStop:function(el){
			if(el._id==null){return;}
			if(!window.requestAnimationFrame){clearTimeout(el._id);
			}else{window.cancelAnimationFrame(el._id);}
			el._id=null;
		},
		/*detect requestAnimationFrame and polyfill*/
		rafPolyfill:function(){
			var pfx=["ms","moz","webkit","o"],i=pfx.length;
			while(--i > -1 && !window.requestAnimationFrame){
				window.requestAnimationFrame=window[pfx[i]+"RequestAnimationFrame"];
				window.cancelAnimationFrame=window[pfx[i]+"CancelAnimationFrame"] || window[pfx[i]+"CancelRequestAnimationFrame"];
			}
		}
	}
	/*detect features*/
	functions.rafPolyfill.call(); /*requestAnimationFrame*/
	$.support.touch=!!('ontouchstart' in window); /*touch*/
	$.support.msPointer=window.navigator.msPointerEnabled; /*MSPointer support*/
	/*plugin dependencies*/
	var _dlp=("https:"==document.location.protocol) ? "https:" : "http:";
	$.event.special.mousewheel || document.write('<script src="'+_dlp+'//cdnjs.cloudflare.com/ajax/libs/jquery-mousewheel/3.0.6/jquery.mousewheel.min.js"><\/script>');
	/*plugin fn*/
	$.fn.mCustomScrollbar=function(method){
		if(methods[method]){
			return methods[method].apply(this,Array.prototype.slice.call(arguments,1));
		}else if(typeof method==="object" || !method){
			return methods.init.apply(this,arguments);
		}else{
			$.error("Method "+method+" does not exist");
		}
	};
})(jQuery);
