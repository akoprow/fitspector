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
var MIN_AUTO_CELL_SIZE = 30;

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

  // --- zoom ---
  $scope.cellSize = MIN_AUTO_CELL_SIZE;
  $scope.zoomIn = function() {
    $scope.cellSize++;
  };

  $scope.zoomOut = function() {
    $scope.cellSize--;
  };

  var zoomReset = function() {
    var windowWidth = $(window).width() - 30;
    $scope.cellSize = Math.floor((windowWidth - 2) / 53) - 1;
    $scope.cellSize = Math.max($scope.cellSize, MIN_AUTO_CELL_SIZE);
  };

  $(window).resize(function() {
    $scope.$apply(function() {
      zoomReset();
    });
  });
  zoomReset();

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
          title: 'Zoom',
          content: 'Depending on your screen size and depending on whether you want a bird\'s-eye view or a better understanding of a particular time period, you may want to adjust the zoom level.',
          target: '.zoom-ctrls .btn',
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
        },
	{
	    title: 'Feedback welcome',
	    content: '<p>We are aware that there are still few quirks and imperfections in this demo. We are working on improving them, but we simply could not wait to share it with you!</p><p>We are very interested to hear what you think. Do you like it? Have some ideas for improvements? Please do let us know at <a href="mailto:feedback@fitspector.com">feedback@fitspector.com</a> or on any social media.</p>',
	    target: '.cal-ctrls',
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

  var drawCalendar = function(redrawType) {
    var width = 2 + ($scope.cellSize + 1) * 52;
    var height = topMargin + ($scope.cellSize + 1) * 8;
    var getWeek = d3.time.format('%U');

    // Main container
    var container = svgContainer().data([$scope.time.year]);
    var gridY = 0.5 * $scope.cellSize + topMargin;
    var enter = container
      .enter()
        .append('svg')
          .attr('class', 'year')
          .attr('width', width)
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
      .delay(redrawType.zoom ? 0 : TRANSITIONS_DURATION)
      .duration(redrawType.zoom ? 0 : TRANSITIONS_DURATION)
      .attr('x', function(d1) {
        var dateOffset = function(d) {
          var week = +getWeek(d);
          return week * $scope.cellSize;
        };
        var d2 = new Date(d1.getFullYear(), d1.getMonth() + 1, 0);
        return (dateOffset(d1) + dateOffset(d2) + $scope.cellSize) / 2;
      });
  };

  var drawDayCells = function(redrawType) {
    var getWeekday = d3.time.format('%w');
    var getWeek = d3.time.format('%U');
    var posX = function(d) {
      return $scope.cellSize * getWeek(d);
    };
    var posY = function(d) {
      return $scope.cellSize * getWeekday(d);
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
        });
      })
      .transition()
        .delay(redrawType.zoom ? 0 : TRANSITIONS_DURATION)
        .duration(redrawType.zoom ? 0 : TRANSITIONS_DURATION)
        .attr('x', posX)
        .attr('y', posY)
        .attr('width', $scope.cellSize)
        .attr('height', $scope.cellSize)
        .style('fill', function(d) { return d > now ? '#f5f5f5' : '#fff'; });
  };

  var drawMonthBorders = function(redrawType) {
    var getWeekday = d3.time.format('%w');
    var getWeek = d3.time.format('%U');

    var monthPath = function(t0) {
      var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0);
      var d0 = +getWeekday(t0);
      var w0 = +getWeek(t0);
      var d1 = +getWeekday(t1);
      var w1 = +getWeek(t1);
      var c = $scope.cellSize;
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
      .delay(redrawType.zoom ? 0 : TRANSITIONS_DURATION)
      .duration(redrawType.zoom ? 0 : TRANSITIONS_DURATION)
      .attr('d', monthPath);
  };

  var getMaxDataValue = function() {
    var fullData = computeWorkoutData(DataProvider.getAllWorkouts());
    return d3.max(fullData, function(d) { return d.value; });
  };

  var getSizeScale = function() {
    // TODO(koper) This is inefficient; we should just cache sizeScale for a given display type.
    return d3.scale.sqrt()
      .domain([0, getMaxDataValue()])
      .rangeRound([0, $scope.cellSize - 1]);
  };

  var drawWorkouts = function(redrawType, data, activeSports) {
    var getWeekday = d3.time.format('%w');
    var getWeek = d3.time.format('%U');

    // TODO(koper) This is copied from drawDayCells, highlighting selected day should be moved there or coded shared.
    var posX = function(d) {
      return $scope.cellSize * getWeek(d);
    };
    var posY = function(d) {
      return $scope.cellSize * getWeekday(d);
    };

    var xScale = d3.scale.linear()
          .domain([0, 52])
          .rangeRound([0, $scope.cellSize * 52]);
    var yScale = d3.scale.linear()
          .domain([0, 6])
          .rangeRound([0, $scope.cellSize * 6]);
    var sizeScale = getSizeScale();

    var workoutsContainer = gridContainer()
          .selectAll('.workoutsContainer');
    var workouts = workoutsContainer
          .selectAll('.workout')
          .data(data, function(d) { return d.key; });

    workouts.exit().transition()
      .duration(TRANSITIONS_DURATION)
      .attr('width', 0)
      .attr('height', 0)
      .attr('x', function(d) { return xScale(+getWeek(d.day) + 0.5); })
      .attr('y', function(d) { return yScale(+getWeekday(d.day) + 0.5); })
      .remove();

    workouts.enter()
      .append('rect')
      .attr('class', 'workout')
      .attr('width', 0)
      .attr('height', 0)
      .attr('x', function(d) { return xScale(+getWeek(d.day) + 0.5); })
      .attr('y', function(d) { return yScale(+getWeekday(d.day) + 0.5); });

    workouts.transition()
      .duration(redrawType.zoom ? 0 : TRANSITIONS_DURATION)
      .delay(TRANSITIONS_DURATION * (redrawType.full ? 2 : (workouts.exit().empty() ? 0 : 1)))
      .attr('width', function(d) { return sizeScale(d.value); })
      .attr('height', function(d) { return sizeScale(d.value); })
      .attr('x', function(d) { return xScale(+getWeek(d.day) + 0.5) - sizeScale(d.value)/2; })
      .attr('y', function(d) { return yScale(+getWeekday(d.day) + 0.5) - sizeScale(d.value)/2; })
      .style('fill', function(d) { return d.color; });

    var selectedDay = workoutsContainer
          .selectAll('.selectedDay')
          .data($scope.selectedDay ? [$scope.selectedDay] : []);
    selectedDay.enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('class', 'selectedDay');
    selectedDay.exit()
      .remove();
    selectedDay.transition()
      .duration(redrawType.zoom ? 0 : TRANSITIONS_DURATION)
      .attr('width', $scope.cellSize)
      .attr('height', $scope.cellSize)
      .attr('x', posX)
      .attr('y', posY);
  };

  var drawSportIcons = function(redrawType, data, activeSports) {
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
        .delay(redrawType.full ? TRANSITIONS_DURATION : 0)
        .duration(TRANSITIONS_DURATION)
        .style('opacity', 0)
        .remove();

      // update
      var update = entries.transition()
            .duration(TRANSITIONS_DURATION * (redrawType.full ? 3 : 1))
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
    var cramped = mode == 'zones' && $scope.cellSize < LEGEND_MIN_CELL_SIZE;

    var marginTop = LEGEND_LABEL_SIZE * (cramped ? 2 : 1);
    // Text size for the description
    d3.select('#legend-' + legendId + ' .text')
      .style('line-height', $scope.cellSize + 'px')
      .style('margin-top', marginTop + 'px');

    var container = d3.select('#legend-' + legendId + ' svg');
    container
      .attr('width', $scope.cellSize * data.length + 1 + LEGEND_PADDING * 2)
      .attr('height', $scope.cellSize + 1 + marginTop);

    // Draw boxes, marks in them and labels on top
    // TODO(koper) Somewhat share the positioning logic with drawing workout boxes. Perhaps use a layout? Or auxiliary functions.
    var sizeScale = getSizeScale();
    _.each(['box', 'mark', 'desc'], function(type) {
      var boxSize = function(d) {
        switch (type) {
        case 'mark': return mode == 'zones' ? $scope.cellSize - 1 : sizeScale(d.val);
        case 'box': return $scope.cellSize;
        case 'desc': return $scope.cellSize;
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
            case 'mark': return LEGEND_PADDING + $scope.cellSize * (i + 0.5) - boxSize(d)/2;
            case 'box': return LEGEND_PADDING + $scope.cellSize * i;
            case 'desc': return LEGEND_PADDING + $scope.cellSize * (i + 0.5);
            default: throw new Error('Unknown element: ' + type);
          }
        })
        .attr('y', function(d, i) {
          switch (type) {
            case 'mark': return marginTop + ($scope.cellSize - boxSize(d)) / 2;
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
      var h = 3600;
      return {
        mode: 'time',
        data: _.map([1, 2, 3, 4, 5],
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

  var redraw = function(redrawType) {
    // Draw the container.
    console.log('Redraw full: ' + redrawType.full + ', zoom: ' + redrawType.zoom);
    if (redrawType.full || redrawType.zoom) {
      drawCalendar(redrawType);
      drawDayCells(redrawType);
      drawMonthBorders(redrawType);
    };

    // Prepare the data.
    var data = filterData();
    var totals = computeTotals(data);
    var workoutData = computeWorkoutData(data, totals.activeSports);

    // Draw workouts.
    drawWorkouts(redrawType, workoutData);

    // Draw sport summaries.
    drawSportIcons(redrawType, totals.data, totals.activeSports);

    // Draw legends
    drawLegends();
  };

  redraw({full: true});

  // --------------------------------------------
  // --- Handling redrawing on data model change
  // --------------------------------------------

  var handleRedraw = function(redrawType) {
    return function(nv, ov) {
      if (nv !== ov) {
        redraw(redrawType);
      }
    };
  };

  $scope.$watch('time.year', handleRedraw({full: true}));
  $scope.$watch('cellSize', handleRedraw({zoom: true}));
  $scope.$watch('sportFilter', handleRedraw({}));
  $scope.$watch('displayType', handleRedraw({}));
  $scope.$watch('sportSummaryType', handleRedraw({}));
  $scope.$watch('selectedDay', handleRedraw({}));

}]);

// --------------------------------------------------------------------------------------------------------
// ---------------------------------------------- Hopscotch -----------------------------------------------
// --------------------------------------------------------------------------------------------------------

/**
 *
 * Copyright 2013 LinkedIn Corp. All rights reserved.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at

 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function(context, namespace) {
  var Hopscotch,
      HopscotchBubble,
      HopscotchCalloutManager,
      HopscotchI18N,
      customI18N,
      Sizzle = window.Sizzle || null,
      utils,
      callbacks,
      helpers,
      winLoadHandler,
      defaultOpts,
      winHopscotch      = context[namespace],
      undefinedStr      = 'undefined',
      waitingToStart    = false, // is a tour waiting for the document to finish
                                 // loading so that it can start?
      hasJquery         = (typeof window.jQuery !== undefinedStr),
      hasSessionStorage = (typeof window.sessionStorage !== undefinedStr),
      document          = window.document;

  defaultOpts       = {
    smoothScroll:    true,
    scrollDuration:  1000,
    scrollTopMargin: 200,
    showCloseButton: true,
    showPrevButton:  false,
    showNextButton:  true,
    bubbleWidth:     280,
    bubblePadding:   15,
    arrowWidth:      20,
    skipIfNoElement: true,
    cookieName:      'hopscotch.tour.state'
  };

  if (winHopscotch) {
    // Hopscotch already exists.
    return;
  }

  if (!Array.isArray) {
    Array.isArray = function(obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    };
  }

  /**
   * Called when the page is done loading.
   *
   * @private
   */
  winLoadHandler = function() {
    if (waitingToStart) {
      winHopscotch.startTour();
    }
  };

  /**
   * utils
   * =====
   * A set of utility functions, mostly for standardizing to manipulate
   * and extract information from the DOM. Basically these are things I
   * would normally use jQuery for, but I don't want to require it for
   * this framework.
   *
   * @private
   */
  utils = {
    /**
     * addClass
     * ========
     * Adds one or more classes to a DOM element.
     *
     * @private
     */
    addClass: function(domEl, classToAdd) {
      var domClasses,
          classToAddArr,
          setClass,
          i,
          len;

      if (!domEl.className) {
        domEl.className = classToAdd;
      }
      else {
        classToAddArr = classToAdd.split(/\s+/);
        domClasses = ' ' + domEl.className + ' ';
        for (i = 0, len = classToAddArr.length; i < len; ++i) {
          if (domClasses.indexOf(' ' + classToAddArr[i] + ' ') < 0) {
            domClasses += classToAddArr[i] + ' ';
          }
        }
        domEl.className = domClasses.replace(/^\s+|\s+$/g,'');
      }
    },

    /**
     * removeClass
     * ===========
     * Remove one or more classes from a DOM element.
     *
     * @private
     */
    removeClass: function(domEl, classToRemove) {
      var domClasses,
          classToRemoveArr,
          currClass,
          i,
          len;

      classToRemoveArr = classToRemove.split(/\s+/);
      domClasses = ' ' + domEl.className + ' ';
      for (i = 0, len = classToRemoveArr.length; i < len; ++i) {
        domClasses = domClasses.replace(' ' + classToRemoveArr[i] + ' ', ' ');
      }
      domEl.className = domClasses.replace(/^\s+|\s+$/g,'');
    },

    /**
     * @private
     */
    getPixelValue: function(val) {
      var valType = typeof val;
      if (valType === 'number') { return val; }
      if (valType === 'string') { return parseInt(val, 10); }
      return 0;
    },

    /**
     * Inspired by Python... returns val if it's defined, otherwise returns the default.
     *
     * @private
     */
    valOrDefault: function(val, valDefault) {
      return typeof val !== undefinedStr ? val : valDefault;
    },

    /**
     * Invokes a single callback represented by an array.
     * Example input: ["my_fn", "arg1", 2, "arg3"]
     * @private
     */
    invokeCallbackArrayHelper: function(arr) {
      // Logic for a single callback
      var fn;
      if (Array.isArray(arr)) {
        fn = helpers[arr[0]];
        if (typeof fn === 'function') {
          return fn.apply(this, arr.slice(1));
        }
      }
    },

    /**
     * Invokes one or more callbacks. Array should have at most one level of nesting.
     * Example input:
     * ["my_fn", "arg1", 2, "arg3"]
     * [["my_fn_1", "arg1", "arg2"], ["my_fn_2", "arg2-1", "arg2-2"]]
     * [["my_fn_1", "arg1", "arg2"], function() { ... }]
     * @private
     */
    invokeCallbackArray: function(arr) {
      var i, len;

      if (Array.isArray(arr)) {
        if (typeof arr[0] === 'string') {
          // Assume there are no nested arrays. This is the one and only callback.
          return utils.invokeCallbackArrayHelper(arr);
        }
        else { // assume an array
          for (i = 0, len = arr.length; i < len; ++i) {
            utils.invokeCallback(arr[i]);
          }
        }
      }
    },

    /**
     * Helper function for invoking a callback, whether defined as a function literal
     * or an array that references a registered helper function.
     * @private
     */
    invokeCallback: function(cb) {
      if (typeof cb === 'function') {
        return cb();
      }
      if (typeof cb === 'string' && helpers[cb]) { // name of a helper
        return helpers[cb]();
      }
      else { // assuming array
        return utils.invokeCallbackArray(cb);
      }
    },

    /**
     * If stepCb (the step-specific helper callback) is passed in, then invoke
     * it first. Then invoke tour-wide helper.
     *
     * @private
     */
    invokeEventCallbacks: function(evtType, stepCb) {
      var cbArr = callbacks[evtType],
          callback,
          fn,
          i,
          len;

      if (stepCb) {
        return this.invokeCallback(stepCb);
      }

      for (i=0, len=cbArr.length; i<len; ++i) {
        this.invokeCallback(cbArr[i].cb);
      }
    },

    /**
     * @private
     */
    getScrollTop: function() {
      var scrollTop;
      if (typeof window.pageYOffset !== undefinedStr) {
        scrollTop = window.pageYOffset;
      }
      else {
        // Most likely IE <=8, which doesn't support pageYOffset
        scrollTop = document.documentElement.scrollTop;
      }
      return scrollTop;
    },

    /**
     * @private
     */
    getScrollLeft: function() {
      var scrollLeft;
      if (typeof window.pageXOffset !== undefinedStr) {
        scrollLeft = window.pageXOffset;
      }
      else {
        // Most likely IE <=8, which doesn't support pageXOffset
        scrollLeft = document.documentElement.scrollLeft;
      }
      return scrollLeft;
    },

    /**
     * @private
     */
    getWindowHeight: function() {
      return window.innerHeight || document.documentElement.clientHeight;
    },

    /**
     * @private
     */
    getWindowWidth: function() {
      return window.innerWidth || document.documentElement.clientWidth;
    },

    /**
     * @private
     */
    addEvtListener: function(el, evtName, fn) {
      return el.addEventListener ? el.addEventListener(evtName, fn, false) : el.attachEvent('on' + evtName, fn);
    },

    /**
     * @private
     */
    removeEvtListener: function(el, evtName, fn) {
      return el.removeEventListener ? el.removeEventListener(evtName, fn, false) : el.detachEvent('on' + evtName, fn);
    },

    documentIsReady: function() {
      return document.readyState === 'complete' || document.readyState === 'interactive';
    },

    /**
     * @private
     */
    evtPreventDefault: function(evt) {
      if (evt.preventDefault) {
        evt.preventDefault();
      }
      else if (event) {
        event.returnValue = false;
      }
    },

    /**
     * @private
     */
    extend: function(obj1, obj2) {
      var prop;
      for (prop in obj2) {
        if (obj2.hasOwnProperty(prop)) {
          obj1[prop] = obj2[prop];
        }
      }
    },

    /**
     * Helper function to get a single target DOM element. We will try to
     * locate the DOM element through several ways, in the following order:
     *
     * 1) Passing the string into document.querySelector
     * 2) Passing the string to jQuery, if it exists
     * 3) Passing the string to Sizzle, if it exists
     * 4) Calling document.getElementById if it is a plain id
     *
     * Default case is to assume the string is a plain id and call
     * document.getElementById on it.
     *
     * @private
     */
    getStepTargetHelper: function(target){
      var result;
      // Check if it's querySelector-eligible. Only accepting IDs and classes,
      // because that's the only thing that makes sense. Tag name and pseudo-class
      // are just silly.
      if (/^[#\.]/.test(target)) {
        if (document.querySelector) {
          return document.querySelector(target);
        }
        if (hasJquery) {
          result = jQuery(target);
          return result.length ? result[0] : null;
        }
        if (Sizzle) {
          result = new Sizzle(target);
          return result.length ? result[0] : null;
        }
        // Regex test for id. Following the HTML 4 spec for valid id formats.
        // (http://www.w3.org/TR/html4/types.html#type-id)
        if (/^#[a-zA-Z][\w-_:.]*$/.test(target)) {
          return document.getElementById(target.substring(1));
        }
        // Can't extract element. Likely IE <=7 and no jQuery/Sizzle.
        return null;
      }
      // Else assume it's a string id.
      return document.getElementById(target);
    },

    /**
     * Given a step, returns the target DOM element associated with it. It is
     * recommended to only assign one target per step. However, there are
     * some use cases which require multiple step targets to be supplied. In
     * this event, we will use the first target in the array that we can
     * locate on the page. See the comments for getStepTargetHelper for more
     * information.
     *
     * @private
     */
    getStepTarget: function(step) {
      var queriedTarget;

      if (!step || !step.target) {
        return null;
      }

      if (typeof step.target === 'string') {
        //Just one target to test. Check, cache, and return its results.
        step.target = utils.getStepTargetHelper(step.target);
        return step.target;
      }
      else if (Array.isArray(step.target)) {
        // Multiple items to check. Check each and return the first success.
        // Assuming they are all strings.
        var i,
            len;

        for (i = 0, len = step.target.length; i < len; i++){
          if (typeof step.target[i] === 'string') {
            queriedTarget = utils.getStepTargetHelper(step.target[i]);

            if (queriedTarget) {
              // Replace step.target with result so we don't have to look it up again.
              step.target = queriedTarget;
              return queriedTarget;
            }
          }
        }
        return null;
      }

      // Assume that the step.target is a DOM element
      return step.target;
    },

    /**
     * Convenience method for getting an i18n string. Returns custom i18n value
     * or the default i18n value if no custom value exists.
     *
     * @private
     */
    getI18NString: function(key) {
      return customI18N[key] || HopscotchI18N[key];
    },

    // Tour session persistence for multi-page tours. Uses HTML5 sessionStorage if available, then
    // falls back to using cookies.
    //
    // The following cookie-related logic is borrowed from:
    // http://www.quirksmode.org/js/cookies.html

    /**
     * @private
     */
    setState: function(name,value,days) {
      var expires = '',
          date;

      if (hasSessionStorage) {
        sessionStorage.setItem(name, value);
      }
      else {
        if (days) {
          date = new Date();
          date.setTime(date.getTime()+(days*24*60*60*1000));
          expires = '; expires='+date.toGMTString();
        }
        document.cookie = name+'='+value+expires+'; path=/';
      }
    },

    /**
     * @private
     */
    getState: function(name) {
      var nameEQ = name + '=',
          ca = document.cookie.split(';'),
          i,
          c,
          state;

      if (hasSessionStorage) {
        state = sessionStorage.getItem(name);
      }
      else {
        for(i=0;i < ca.length;i++) {
          c = ca[i];
          while (c.charAt(0)===' ') {c = c.substring(1,c.length);}
          if (c.indexOf(nameEQ) === 0) {
            state = c.substring(nameEQ.length,c.length);
            break;
          }
        }
      }

      return state;
    },

    /**
     * @private
     */
    clearState: function(name) {
      if (hasSessionStorage) {
        sessionStorage.removeItem(name);
      }
      else {
        this.setState(name,'',-1);
      }
    }
  };

  utils.addEvtListener(window, 'load', winLoadHandler);

  callbacks = {
    next:  [],
    prev:  [],
    start: [],
    end:   [],
    show:  [],
    error: [],
    close: []
  };

  /**
   * helpers
   * =======
   * A map of functions to be used as callback listeners. Functions are
   * added to and removed from the map using the functions
   * Hopscotch.registerHelper() and Hopscotch.unregisterHelper().
   */
  helpers = {};

  HopscotchI18N = {
    stepNums: null,
    nextBtn: 'Next',
    prevBtn: 'Back',
    doneBtn: 'Done',
    skipBtn: 'Skip',
    closeTooltip: 'Close'
  };

  customI18N = {}; // Developer's custom i18n strings goes here.

  /**
   * HopscotchBubble
   *
   * @class The HopscotchBubble class represents the view of a bubble. This class is also used for Hopscotch callouts.
   */
  HopscotchBubble = function(opt) {
    this.init(opt);
  };

  HopscotchBubble.prototype = {
    isShowing: false,

    currStep: undefined,

    /**
     * Helper function for creating buttons in the bubble.
     *
     * @private
     */
    _createButton: function(id, text) {
      var btnEl = document.createElement('button'),
          className = 'hopscotch-nav-button';

      btnEl.id = id;
      if (text) {
        btnEl.innerHTML = text;
      }

      if (id.indexOf('prev') >= 0) {
        className += ' prev';
      }
      else {
        className += ' next';
      }

      utils.addClass(btnEl, className);

      return btnEl;
    },

    /**
     * setPosition
     *
     * Sets the position of the bubble using the bounding rectangle of the
     * target element and the orientation and offset information specified by
     * the JSON.
     */
    setPosition: function(step) {
      var bubbleWidth,
          bubbleHeight,
          bubblePadding,
          boundingRect,
          top,
          left,
          arrowOffset,
          bubbleBorder = 6,
          targetEl     = utils.getStepTarget(step),
          el           = this.element,
          arrowEl      = this.arrowEl;

      bubbleWidth   = utils.getPixelValue(step.width) || this.opt.bubbleWidth;
      bubblePadding = utils.valOrDefault(step.padding, this.opt.bubblePadding);
      utils.removeClass(el, 'fade-in-down fade-in-up fade-in-left fade-in-right');

      // Originally called it orientation, but placement is more intuitive.
      // Allowing both for now for backwards compatibility.
      if (!step.placement && step.orientation) {
        step.placement = step.orientation;
      }

      // SET POSITION
      boundingRect = targetEl.getBoundingClientRect();
      if (step.placement === 'top') {
        bubbleHeight = el.offsetHeight;
        top = (boundingRect.top - bubbleHeight) - this.opt.arrowWidth;
        left = boundingRect.left;
      }
      else if (step.placement === 'bottom') {
        top = boundingRect.bottom + this.opt.arrowWidth;
        left = boundingRect.left;
      }
      else if (step.placement === 'left') {
        top = boundingRect.top;
        left = boundingRect.left - bubbleWidth - 2*bubblePadding - 2*bubbleBorder - this.opt.arrowWidth;
      }
      else if (step.placement === 'right') {
        top = boundingRect.top;
        left = boundingRect.right + this.opt.arrowWidth;
      }

      // SET (OR RESET) ARROW OFFSETS
      if (step.arrowOffset !== 'center') {
        arrowOffset = utils.getPixelValue(step.arrowOffset);
      }
      else {
        arrowOffset = step.arrowOffset;
      }
      if (!arrowOffset) {
        arrowEl.style.top = '';
        arrowEl.style.left = '';
      }
      else if (step.placement === 'top' || step.placement === 'bottom') {
        arrowEl.style.top = '';
        if (arrowOffset === 'center') {
          arrowEl.style.left = bubbleWidth/2 + bubblePadding - arrowEl.offsetWidth/2 + 'px';
        }
        else {
          // Numeric pixel value
          arrowEl.style.left = arrowOffset + 'px';
        }
      }
      else if (step.placement === 'left' || step.placement === 'right') {
        arrowEl.style.left = '';
        if (arrowOffset === 'center') {
          bubbleHeight = bubbleHeight || el.offsetHeight;
          arrowEl.style.top = bubbleHeight/2 + bubblePadding - arrowEl.offsetHeight/2 + 'px';
        }
        else {
          // Numeric pixel value
          arrowEl.style.top = arrowOffset + 'px';
        }
      }

      // HORIZONTAL OFFSET
      if (step.xOffset === 'center') {
        left = (boundingRect.left + targetEl.offsetWidth/2) - (bubbleWidth/2) - bubblePadding;
      }
      else {
        left += utils.getPixelValue(step.xOffset);
      }
      // VERTICAL OFFSET
      if (step.yOffset === 'center') {
        bubbleHeight = bubbleHeight || el.offsetHeight;
        top = (boundingRect.top + targetEl.offsetHeight/2) - (bubbleHeight/2) - bubblePadding;
      }
      else {
        top += utils.getPixelValue(step.yOffset);
      }

      // ADJUST TOP FOR SCROLL POSITION
      if (!step.fixedElement) {
        top += utils.getScrollTop();
        left += utils.getScrollLeft();
      }

      // ACCOUNT FOR FIXED POSITION ELEMENTS
      el.style.position = (step.fixedElement ? 'fixed' : 'absolute');

      el.style.top = top + 'px';
      el.style.left = left + 'px';
    },

    /**
     * @private
     */
    _initNavButtons: function() {
      var buttonsEl  = document.createElement('div');

      this.prevBtnEl = this._createButton('hopscotch-prev', utils.getI18NString('prevBtn'));
      this.nextBtnEl = this._createButton('hopscotch-next', utils.getI18NString('nextBtn'));
      this.doneBtnEl = this._createButton('hopscotch-done', utils.getI18NString('doneBtn'));
      this.ctaBtnEl  = this._createButton('hopscotch-cta');
      utils.addClass(this.doneBtnEl, 'hide');

      buttonsEl.appendChild(this.prevBtnEl);
      buttonsEl.appendChild(this.ctaBtnEl);
      buttonsEl.appendChild(this.nextBtnEl);
      buttonsEl.appendChild(this.doneBtnEl);

      // Attach click listeners
      utils.addEvtListener(this.prevBtnEl, 'click', function(evt) {
        winHopscotch.prevStep(true);
      });

      utils.addEvtListener(this.nextBtnEl, 'click', function(evt) {
        winHopscotch.nextStep(true);
      });
      utils.addEvtListener(this.doneBtnEl, 'click', function(evt) {
        winHopscotch.endTour();
      });

      buttonsEl.className = 'hopscotch-actions';
      this.buttonsEl = buttonsEl;

      this.containerEl.appendChild(buttonsEl);
      return this;
    },

    /*
     * Define the close button callback here so that we have a handle on it
     * for when we want to remove it (see HopscotchBubble.destroy).
     *
     * @private
     */
    _getCloseFn: function() {
      var self = this;

      if (!this.closeFn) {
        /**
         * @private
         */
        this.closeFn = function(evt) {
          if (self.opt.onClose) {
            utils.invokeCallback(self.opt.onClose);
          }
          if (self.opt.id && !self.opt.isTourBubble) {
            // Remove via the HopscotchCalloutManager.
            // removeCallout() calls HopscotchBubble.destroy internally.
            winHopscotch.getCalloutManager().removeCallout(self.opt.id);
          }
          else {
            self.destroy();
          }

          utils.evtPreventDefault(evt);
        };
      }
      return this.closeFn;
    },

    /**
     * @private
     */
    initCloseButton: function() {
      var closeBtnEl = document.createElement('a');

      closeBtnEl.className = 'hopscotch-bubble-close';
      closeBtnEl.href = '#';
      closeBtnEl.title = utils.getI18NString('closeTooltip');
      closeBtnEl.innerHTML = utils.getI18NString('closeTooltip');

      if (this.opt.isTourBubble) {
        utils.addEvtListener(closeBtnEl, 'click', function(evt) {
          var currStepNum   = winHopscotch.getCurrStepNum(),
              currTour      = winHopscotch.getCurrTour(),
              doEndCallback = (currStepNum === currTour.steps.length-1);

          utils.invokeEventCallbacks('close');

          winHopscotch.endTour(true, doEndCallback);

          if (evt.preventDefault) {
            evt.preventDefault();
          }
          else if (event) {
            event.returnValue = false;
          }
        });
      }
      else {
        utils.addEvtListener(closeBtnEl, 'click', this._getCloseFn());
      }

      if (!utils.valOrDefault(this.opt.showCloseButton, true)) {
        utils.addClass(closeBtnEl, 'hide');
      }

      this.closeBtnEl = closeBtnEl;
      this.containerEl.appendChild(closeBtnEl);
      return this;
    },

    /**
     * @private
     */
    _initArrow: function() {
      var arrowEl,
          arrowBorderEl;

      this.arrowEl = document.createElement('div');
      this.arrowEl.className = 'hopscotch-bubble-arrow-container';

      arrowBorderEl = document.createElement('div');
      arrowBorderEl.className = 'hopscotch-bubble-arrow-border';

      arrowEl = document.createElement('div');
      arrowEl.className = 'hopscotch-bubble-arrow';

      this.arrowEl.appendChild(arrowBorderEl);
      this.arrowEl.appendChild(arrowEl);

      this.element.appendChild(this.arrowEl);
      return this;
    },

    /**
     * Set up the CTA button, using the `showCTAButton`, `ctaLabel`, and
     * `onCTA` properties.
     *
     * @private
     */
    _setupCTAButton: function(step) {
      var callback,
          self = this;

      this._showButton(this.ctaBtnEl, !!step.showCTAButton);
      if (step.showCTAButton && step.ctaLabel) {
        this.ctaBtnEl.innerHTML = step.ctaLabel;

        // Create callback to remove the callout. If a onCTA callback is
        // provided, call it from within this one.
        this._ctaFn = function() {
          if (!self.opt.isTourBubble) {
            // This is a callout. Close the callout when CTA is clicked.
            winHopscotch.getCalloutManager().removeCallout(step.id);
          }
          // Call onCTA callback if one is provided
          if (step.onCTA && typeof step.onCTA === 'function') {
            step.onCTA();
          }
        };

        utils.addEvtListener(this.ctaBtnEl, 'click', this._ctaFn);
      }
    },

    /**
     * Remove any previously attached CTA listener.
     *
     * @private
     */
    _removeCTACallback: function() {
      if (this.ctaBtnEl && this._ctaFn) {
        utils.removeEvtListener(this.ctaBtnEl, 'click', this._ctaFn);
        this._ctaFn = null;
      }
    },

    /**
     * Renders the bubble according to the step JSON.
     *
     * @param {Object} step Information defining how the bubble should look.
     * @param {Number} idx The index of the step in the tour. Not used for callouts.
     * @param {Boolean} isLast Flag indicating if the step is the last in the tour. Not used for callouts.
     * @param {Function} callback Function to be invoked after rendering is finished.
     */
    render: function(step, idx, isLast, callback) {
      var el = this.element,
          showNext,
          showPrev,
          bubbleWidth,
          bubblePadding;

      if (step) {
        this.currStep = step;
      }
      else if (this.currStep) {
        step = this.currStep;
      }

      // Originally called it orientation, but placement is more intuitive.
      // Allowing both for now for backwards compatibility.
      if (!step.placement && step.orientation) {
        step.placement = step.orientation;
      }

      showNext = utils.valOrDefault(step.showNextButton, this.opt.showNextButton);
      showPrev = utils.valOrDefault(step.showPrevButton, this.opt.showPrevButton);
      this.setTitle(step.title || '');
      this.setContent(step.content || '');

      if (this.opt.isTourBubble) {
        this.setNum(idx);
      }

      this.placement = step.placement;

      this.showPrevButton(this.prevBtnEl && showPrev && idx > 0);
      this.showNextButton(this.nextBtnEl && showNext && !isLast);
      this.nextBtnEl.innerHTML = step.showSkip ? utils.getI18NString('skipBtn') : utils.getI18NString('nextBtn');

      if (isLast) {
        utils.removeClass(this.doneBtnEl, 'hide');
      }
      else {
        utils.addClass(this.doneBtnEl, 'hide');
      }

      // Show/hide CTA button
      this._setupCTAButton(step);

      this._setArrow(step.placement);

      // Set dimensions
      bubbleWidth   = utils.getPixelValue(step.width) || this.opt.bubbleWidth;
      bubblePadding = utils.valOrDefault(step.padding, this.opt.bubblePadding);
      this.containerEl.style.width = bubbleWidth + 'px';
      this.containerEl.style.padding = bubblePadding + 'px';

      el.style.zIndex = step.zindex || '';

      if (step.placement === 'top') {
        // For bubbles placed on top of elements, we need to get the
        // bubble height to correctly calculate the bubble position.
        // Show it briefly offscreen to calculate height, then hide
        // it again.
        el.style.top = '-9999px';
        el.style.left = '-9999px';
        utils.removeClass(el, 'hide');
        this.setPosition(step);
        utils.addClass(el, 'hide');
      }
      else {
        // Don't care about height for the other orientations.
        this.setPosition(step);
      }

      // only want to adjust window scroll for non-fixed elements
      if (callback) {
        callback(!step.fixedElement);
      }

      return this;
    },

    setTitle: function(titleStr) {
      if (titleStr) {
        this.titleEl.innerHTML = titleStr;
        utils.removeClass(this.titleEl, 'hide');
      }
      else {
        utils.addClass(this.titleEl, 'hide');
      }
      return this;
    },

    setContent: function(contentStr) {
      // CAREFUL!! Using innerHTML, so don't use any user-generated
      // content here. (or if you must, escape it first)
      if (contentStr) {
        this.contentEl.innerHTML = contentStr;
        utils.removeClass(this.contentEl, 'hide');
      }
      else {
        utils.addClass(this.contentEl, 'hide');
      }
      return this;
    },

    setNum: function(idx) {
      var stepNumI18N = utils.getI18NString('stepNums');
      if (stepNumI18N && idx < stepNumI18N.length) {
        idx = stepNumI18N[idx];
      }
      else {
        idx = idx + 1;
      }
      this.numberEl.innerHTML = idx;
    },

    /**
     * Sets which side the arrow is on.
     *
     * @private
     */
    _setArrow: function(orientation) {
      utils.removeClass(this.arrowEl, 'down up right left');

      // Whatever the orientation is, we want to arrow to appear
      // "opposite" of the orientation. E.g., a top orientation
      // requires a bottom arrow.
      if (orientation === 'top') {
        utils.addClass(this.arrowEl, 'down');
      }
      else if (orientation === 'bottom') {
        utils.addClass(this.arrowEl, 'up');
      }
      else if (orientation === 'left') {
        utils.addClass(this.arrowEl, 'right');
      }
      else if (orientation === 'right') {
        utils.addClass(this.arrowEl, 'left');
      }
    },

    /**
     * @private
     */
    _getArrowDirection: function() {
      if (this.placement === 'top') {
        return 'down';
      }
      if (this.placement === 'bottom') {
        return 'up';
      }
      if (this.placement === 'left') {
        return 'right';
      }
      if (this.placement === 'right') {
        return 'left';
      }
    },

    show: function() {
      var self      = this,
          fadeClass = 'fade-in-' + this._getArrowDirection(),
          fadeDur   = 1000;

      utils.removeClass(this.element, 'hide');
      utils.addClass(this.element, fadeClass);
      setTimeout(function() {
        utils.removeClass(self.element, 'invisible');
      }, 50);
      setTimeout(function() {
        utils.removeClass(self.element, fadeClass);
      }, fadeDur);
      this.isShowing = true;
      return this;
    },

    hide: function(remove) {
      var el = this.element;

      remove = utils.valOrDefault(remove, true);
      el.style.top = '';
      el.style.left = '';

      // display: none
      if (remove) {
        utils.addClass(el, 'hide');
        utils.removeClass(el, 'invisible');
      }
      // opacity: 0
      else {
        utils.removeClass(el, 'hide');
        utils.addClass(el, 'invisible');
      }
      utils.removeClass(el, 'animate fade-in-up fade-in-down fade-in-right fade-in-left');
      this.isShowing = false;
      return this;
    },

    /**
     * @private
     */
    _showButton: function(btnEl, show, permanent) {
      var classname = 'hide';

      if (permanent) {
        // permanent is a flag that indicates we should never show the button
        classname = 'hide-all';
      }
      if (typeof show === undefinedStr) {
        show = true;
      }

      if (show) { utils.removeClass(btnEl, classname); }
      else { utils.addClass(btnEl, classname); }
    },

    showPrevButton: function(show) {
      this._showButton(this.prevBtnEl, show);
    },

    showNextButton: function(show) {
      this._showButton(this.nextBtnEl, show);
    },

    showCloseButton: function(show) {
      this._showButton(this.closeBtnEl, show);
    },

    destroy: function() {
      var el = this.element;

      if (el) {
        el.parentNode.removeChild(el);
      }
      if (this.closeBtnEl) {
        utils.removeEvtListener(this.closeBtnEl, 'click', this._getCloseFn());
      }
      if (this.ctaBtnEl && this.onCTA) {
        this._removeCTACallback();
      }
    },

    /**
     * updateButtons
     *
     * When the config options are changed, we should call this method to
     * update the buttons.
     *
     * @param {Object} opt The options for the callout. For the most
     * part, these are the same options as you would find in a tour
     * step.
     */
    updateButtons: function() {
      this.showPrevButton(this.opt.showPrevButton);
      this.showNextButton(this.opt.showNextButton);
      this.showCloseButton(this.opt.showCloseButton);
      this.prevBtnEl.innerHTML = utils.getI18NString('prevBtn');
      this.nextBtnEl.innerHTML = utils.getI18NString('nextBtn');
      this.doneBtnEl.innerHTML = utils.getI18NString('doneBtn');
    },

    init: function(initOpt) {
      var el              = document.createElement('div'),
          containerEl     = document.createElement('div'),
          bubbleContentEl = document.createElement('div'),
          self            = this,
          resizeCooldown  = false, // for updating after window resize
          onWinResize,
          appendToBody,
          opt;

      this.element        = el;
      this.containerEl    = containerEl;
      this.titleEl        = document.createElement('h3');
      this.contentEl      = document.createElement('div');

      utils.addClass(this.titleEl, 'hopscotch-title');
      utils.addClass(this.contentEl, 'hopscotch-content');

      opt = {
        showPrevButton: defaultOpts.showPrevButton,
        showNextButton: defaultOpts.showNextButton,
        bubbleWidth:    defaultOpts.bubbleWidth,
        bubblePadding:  defaultOpts.bubblePadding,
        arrowWidth:     defaultOpts.arrowWidth,
        showNumber:     true,
        isTourBubble:   true
      };

      initOpt = (typeof initOpt === undefinedStr ? {} : initOpt);

      utils.extend(opt, initOpt);
      this.opt = opt;

      el.className = 'hopscotch-bubble animated'; // "animated" for fade css animation
      containerEl.className = 'hopscotch-bubble-container';

      if (!opt.isTourBubble) {
        el.className += ' hopscotch-callout';
      }

      if (opt.isTourBubble) {
        this.numberEl           = document.createElement('span');
        this.numberEl.className = 'hopscotch-bubble-number';
        containerEl.appendChild(this.numberEl);
      }
      else {
        utils.addClass(el, 'no-number');
      }

      bubbleContentEl.appendChild(this.titleEl);
      bubbleContentEl.appendChild(this.contentEl);
      bubbleContentEl.className = 'hopscotch-bubble-content';
      containerEl.appendChild(bubbleContentEl);
      el.appendChild(containerEl);

      this._initNavButtons();
      this.initCloseButton();

      this._initArrow();

      /**
       * Not pretty, but IE8 doesn't support Function.bind(), so I'm
       * relying on closures to keep a handle of "this".
       * Reset position of bubble when window is resized
       *
       * @private
       */
      onWinResize = function() {
        if (resizeCooldown || !self.isShowing) {
          return;
        }

        resizeCooldown = true;
        setTimeout(function() {
          self.setPosition(self.currStep);
          resizeCooldown = false;
        }, 100);
      };

      utils.addEvtListener(window, 'resize', onWinResize);

      this.hide();

      /**
       * Append to body once the DOM is ready.
       */
      if (utils.documentIsReady()) {
        document.body.appendChild(el);
      }
      else {
        // Moz, webkit, Opera
        if (document.addEventListener) {
          appendToBody = function() {
            document.removeEventListener('DOMContentLoaded', appendToBody);
            window.removeEventListener('load', appendToBody);

            document.body.appendChild(el);
          };

          document.addEventListener('DOMContentLoaded', appendToBody, false);
        }
        // IE
        else {
          appendToBody = function() {
            if (document.readyState === 'complete') {
              document.detachEvent('onreadystatechange', appendToBody);
              window.detachEvent('onload', appendToBody);
              document.body.appendChild(el);
            }
          };

          document.attachEvent('onreadystatechange', appendToBody);
        }
        utils.addEvtListener(window, 'load', appendToBody);
      }
    }
  };

  /**
   * HopscotchCalloutManager
   *
   * @class Manages the creation and destruction of single callouts.
   * @constructor
   */
  HopscotchCalloutManager = function() {
    var callouts = {};

    /**
     * createCallout
     *
     * Creates a standalone callout. This callout has the same API
     * as a Hopscotch tour bubble.
     *
     * @param {Object} opt The options for the callout. For the most
     * part, these are the same options as you would find in a tour
     * step.
     */
    this.createCallout = function(opt) {
      var callout;

      if (opt.id) {
        if (callouts[opt.id]) {
          throw 'Callout by that id already exists. Please choose a unique id.';
        }
        opt.showNextButton = opt.showPrevButton = false;
        opt.isTourBubble = false;
        callout = new HopscotchBubble(opt);
        callouts[opt.id] = callout;
        if (opt.target) {
          callout.render(opt, null, null, function() {
            callout.show();
          });
        }
      }
      else {
        throw 'Must specify a callout id.';
      }
      return callout;
    };

    /**
     * getCallout
     *
     * Returns a callout by its id.
     *
     * @param {String} id The id of the callout to fetch.
     * @returns {Object} HopscotchBubble
     */
    this.getCallout = function(id) {
      return callouts[id];
    };

    /**
     * removeAllCallouts
     *
     * Removes all existing callouts.
     */
    this.removeAllCallouts = function() {
      var calloutId,
          callout;

      for (calloutId in callouts) {
        if (callouts.hasOwnProperty(calloutId)) {
          this.removeCallout(calloutId);
        }
      }
    };

    /**
     * removeAllCallout
     *
     * Removes an existing callout by id.
     *
     * @param {String} id The id of the callout to remove.
     */
    this.removeCallout = function(id) {
      var callout = callouts[id];

      callouts[id] = null;
      if (!callout) { return; }

      callout.destroy();
    };
  };

  /**
   * Hopscotch
   *
   * @class Creates the Hopscotch object. Used to manage tour progress and configurations.
   * @constructor
   * @param {Object} initOptions Options to be passed to `configure()`.
   */
  Hopscotch = function(initOptions) {
    var self       = this, // for targetClickNextFn
        bubble,
        calloutMgr,
        opt,
        currTour,
        currStepNum,
        cookieTourId,
        cookieTourStep,
        _configure,

    /**
     * getBubble
     *
     * Singleton accessor function for retrieving or creating bubble object.
     *
     * @private
     * @param setOptions {Boolean} when true, transfers configuration options to the bubble
     * @returns {Object} HopscotchBubble
     */
    getBubble = function(setOptions) {
      if (!bubble) {
        bubble = new HopscotchBubble(opt);
      }
      if (setOptions) {
        utils.extend(bubble.opt, {
          bubblePadding:   getOption('bubblePadding'),
          bubbleWidth:     getOption('bubbleWidth'),
          showNextButton:  getOption('showNextButton'),
          showPrevButton:  getOption('showPrevButton'),
          showCloseButton: getOption('showCloseButton'),
          arrowWidth:      getOption('arrowWidth')
        });
        bubble.updateButtons();
      }
      return bubble;
    },

    /**
     * Convenience method for getting an option. Returns custom config option
     * or the default config option if no custom value exists.
     *
     * @private
     * @param name {String} config option name
     * @returns {Object} config option value
     */
    getOption = function(name) {
      if (typeof opt === 'undefined') {
        return defaultOpts[name];
      }
      return utils.valOrDefault(opt[name], defaultOpts[name]);
    },

    /**
     * getCurrStep
     *
     * @private
     * @returns {Object} the step object corresponding to the current value of currStepNum
     */
    getCurrStep = function() {
      var step;

      if (currStepNum < 0 || currStepNum >= currTour.steps.length) {
        step = null;
      }
      else {
        step = currTour.steps[currStepNum];
      }

      return step;
    },

    /**
     * Used for nextOnTargetClick
     *
     * @private
     */
    targetClickNextFn = function() {
      self.nextStep();
    },

    /**
     * adjustWindowScroll
     *
     * Checks if the bubble or target element is partially or completely
     * outside of the viewport. If it is, adjust the window scroll position
     * to bring it back into the viewport.
     *
     * @private
     * @param {Function} cb Callback to invoke after done scrolling.
     */
    adjustWindowScroll = function(cb) {
      var bubble         = getBubble(),

          // Calculate the bubble element top and bottom position
          bubbleEl       = bubble.element,
          bubbleTop      = utils.getPixelValue(bubbleEl.style.top),
          bubbleBottom   = bubbleTop + utils.getPixelValue(bubbleEl.offsetHeight),

          // Calculate the target element top and bottom position
          targetEl       = utils.getStepTarget(getCurrStep()),
          targetBounds   = targetEl.getBoundingClientRect(),
          targetElTop    = targetBounds.top + utils.getScrollTop(),
          targetElBottom = targetBounds.bottom + utils.getScrollTop(),

          // The higher of the two: bubble or target
          targetTop      = (bubbleTop < targetElTop) ? bubbleTop : targetElTop,
          // The lower of the two: bubble or target
          targetBottom   = (bubbleBottom > targetElBottom) ? bubbleBottom : targetElBottom,

          // Calculate the current viewport top and bottom
          windowTop      = utils.getScrollTop(),
          windowBottom   = windowTop + utils.getWindowHeight(),

          // This is our final target scroll value.
          scrollToVal    = targetTop - getOption('scrollTopMargin'),

          scrollEl,
          yuiAnim,
          yuiEase,
          direction,
          scrollIncr,
          scrollTimeout,
          scrollTimeoutFn;

      // Target and bubble are both visible in viewport
      if (targetTop >= windowTop && (targetTop <= windowTop + getOption('scrollTopMargin') || targetBottom <= windowBottom)) {
        if (cb) { cb(); } // HopscotchBubble.show
      }

      // Abrupt scroll to scroll target
      else if (!getOption('smoothScroll')) {
        window.scrollTo(0, scrollToVal);

        if (cb) { cb(); } // HopscotchBubble.show
      }

      // Smooth scroll to scroll target
      else {
        // Use YUI if it exists
        if (typeof YAHOO             !== undefinedStr &&
            typeof YAHOO.env         !== undefinedStr &&
            typeof YAHOO.env.ua      !== undefinedStr &&
            typeof YAHOO.util        !== undefinedStr &&
            typeof YAHOO.util.Scroll !== undefinedStr) {
          scrollEl = YAHOO.env.ua.webkit ? document.body : document.documentElement;
          yuiEase = YAHOO.util.Easing ? YAHOO.util.Easing.easeOut : undefined;
          yuiAnim = new YAHOO.util.Scroll(scrollEl, {
            scroll: { to: [0, scrollToVal] }
          }, getOption('scrollDuration')/1000, yuiEase);
          yuiAnim.onComplete.subscribe(cb);
          yuiAnim.animate();
        }

        // Use jQuery if it exists
        else if (hasJquery) {
          jQuery('body, html').animate({ scrollTop: scrollToVal }, getOption('scrollDuration'), cb);
        }

        // Use my crummy setInterval scroll solution if we're using plain, vanilla Javascript.
        else {
          if (scrollToVal < 0) {
            scrollToVal = 0;
          }

          // 48 * 10 == 480ms scroll duration
          // make it slightly less than CSS transition duration because of
          // setInterval overhead.
          // To increase or decrease duration, change the divisor of scrollIncr.
          direction = (windowTop > targetTop) ? -1 : 1; // -1 means scrolling up, 1 means down
          scrollIncr = Math.abs(windowTop - scrollToVal) / (getOption('scrollDuration')/10);
          scrollTimeoutFn = function() {
            var scrollTop = utils.getScrollTop(),
                scrollTarget = scrollTop + (direction * scrollIncr);

            if ((direction > 0 && scrollTarget >= scrollToVal) ||
                (direction < 0 && scrollTarget <= scrollToVal)) {
              // Overshot our target. Just manually set to equal the target
              // and clear the interval
              scrollTarget = scrollToVal;
              if (cb) { cb(); } // HopscotchBubble.show
              window.scrollTo(0, scrollTarget);
              return;
            }

            window.scrollTo(0, scrollTarget);

            if (utils.getScrollTop() === scrollTop) {
              // Couldn't scroll any further.
              if (cb) { cb(); } // HopscotchBubble.show
              return;
            }

            // If we reached this point, that means there's still more to scroll.
            setTimeout(scrollTimeoutFn, 10);
          };

          scrollTimeoutFn();
        }
      }
    },

    /**
     * goToStepWithTarget
     *
     * Helper function to increment the step number until a step is found where
     * the step target exists or until we reach the end/beginning of the tour.
     *
     * @private
     * @param {Number} direction Either 1 for incrementing or -1 for decrementing
     * @param {Function} cb The callback function to be invoked when the step has been found
     */
    goToStepWithTarget = function(direction, cb) {
      var target,
          step,
          goToStepFn;

      if (currStepNum + direction >= 0 &&
          currStepNum + direction < currTour.steps.length) {

        currStepNum += direction;
        step = getCurrStep();

        goToStepFn = function() {
          target = utils.getStepTarget(step);

          if (target) {
            // We're done! Return the step number via the callback.
            cb(currStepNum);
          }
          else {
            // Haven't found a valid target yet. Recursively call
            // goToStepWithTarget.
            utils.invokeEventCallbacks('error');
            goToStepWithTarget(direction, cb);
          }
        };

        if (step.delay) {
          setTimeout(goToStepFn, step.delay);
        }
        else {
          goToStepFn();
        }
      }
      else {
        cb(-1); // signal that we didn't find any step with a valid target
      }
    },

    /**
     * changeStep
     *
     * Helper function to change step by going forwards or backwards 1.
     * nextStep and prevStep are publicly accessible wrappers for this function.
     *
     * @private
     * @param {Boolean} doCallbacks Flag for invoking onNext or onPrev callbacks
     * @param {Number} direction Either 1 for "next" or -1 for "prev"
     */
    changeStep = function(doCallbacks, direction) {
      var bubble = getBubble(),
          self = this,
          step,
          origStep,
          wasMultiPage,
          changeStepCb;

      bubble.hide()._removeCTACallback();

      doCallbacks = utils.valOrDefault(doCallbacks, true);
      step = getCurrStep();
      origStep = step;
      if (direction > 0) {
        wasMultiPage = origStep.multipage;
      }
      else {
        wasMultiPage = (currStepNum > 0 && currTour.steps[currStepNum-1].multipage);
      }

      /**
       * Callback for goToStepWithTarget
       *
       * @private
       */
      changeStepCb = function(stepNum) {
        var doShowFollowingStep;

        if (stepNum === -1) {
          // Wasn't able to find a step with an existing element. End tour.
          return this.endTour(true);
        }

        if (doCallbacks) {
          if (direction > 0) {
            doShowFollowingStep = utils.invokeEventCallbacks('next', origStep.onNext);
          }
          else {
            doShowFollowingStep = utils.invokeEventCallbacks('prev', origStep.onPrev);
          }
        }

        if (wasMultiPage) {
          // Update state for the next page
          utils.setState(getOption('cookieName'), currTour.id + ':' + currStepNum, 1);

          // Next step is on a different page, so no need to attempt to render it.
          return;
        }

        doShowFollowingStep = utils.valOrDefault(doShowFollowingStep, true);

        // If the onNext/onPrev callback returned false, halt the tour and
        // don't show the next step.
        if (doShowFollowingStep) {
          this.showStep(stepNum);
        }
        else {
          // Halt tour (but don't clear state)
          this.endTour(false);
        }
      };

      if (!wasMultiPage && getOption('skipIfNoElement')) {
        goToStepWithTarget(direction, function(stepNum) {
          changeStepCb.call(self, stepNum);
        });
      }
      else if (currStepNum + direction >= 0 && currStepNum + direction < currTour.steps.length) {
        // only try incrementing once, and invoke error callback if no target is found
        currStepNum += direction;
        step = getCurrStep();
        if (!utils.getStepTarget(step) && !wasMultiPage) {
          utils.invokeEventCallbacks('error');
          return this.endTour(true, false);
        }
        changeStepCb.call(this, currStepNum);
      }

      return this;
    },

    /**
     * loadTour
     *
     * Loads, but does not display, tour.
     *
     * @private
     * @param tour The tour JSON object
     */
    loadTour = function(tour) {
      var tmpOpt = {},
          prop,
          tourState,
          tourPair;

      // Set tour-specific configurations
      for (prop in tour) {
        if (tour.hasOwnProperty(prop) &&
            prop !== 'id' &&
            prop !== 'steps') {
          tmpOpt[prop] = tour[prop];
        }
      }

      //this.resetDefaultOptions(); // reset all options so there are no surprises
      // TODO check number of config properties of tour
      _configure.call(this, tmpOpt, true);

      // Get existing tour state, if it exists.
      tourState = utils.getState(getOption('cookieName'));
      if (tourState) {
        tourPair            = tourState.split(':');
        cookieTourId        = tourPair[0]; // selecting tour is not supported by this framework.
        cookieTourStep      = tourPair[1];

        cookieTourStep    = parseInt(cookieTourStep, 10);
      }

      return this;
    },

    /**
     * Find the first step to show for a tour. (What is the first step with a
     * target on the page?)
     */
    findStartingStep = function(startStepNum, cb) {
      var step,
          target,
          stepNum;

      currStepNum = startStepNum || 0;
      step        = getCurrStep();
      target      = utils.getStepTarget(step);

      if (target) {
        // First step had an existing target.
        cb(currStepNum);
        return;
      }

      if (!target) {
        // Previous target doesn't exist either. The user may have just
        // clicked on a link that wasn't part of the tour. Another possibility is that
        // the user clicked on the correct link, but the target is just missing for
        // whatever reason. In either case, we should just advance until we find a step
        // that has a target on the page or end the tour if we can't find such a step.
        utils.invokeEventCallbacks('error');

        if (getOption('skipIfNoElement')) {
          goToStepWithTarget(1, cb);
          return;
        }
        else {
          currStepNum = -1;
          cb(currStepNum);
        }
      }
    },

    showStepHelper = function(stepNum) {
      var step         = currTour.steps[stepNum],
          tourSteps    = currTour.steps,
          numTourSteps = tourSteps.length,
          cookieVal    = currTour.id + ':' + stepNum,
          bubble       = getBubble(),
          targetEl     = utils.getStepTarget(step),
          isLast,
          showBubble;

      showBubble = function() {
        bubble.show();
        utils.invokeEventCallbacks('show', step.onShow);
      };

      // Update bubble for current step
      currStepNum    = stepNum;

      bubble.hide(false);

      isLast = (stepNum === numTourSteps - 1);
      bubble.render(step, stepNum, isLast, function(adjustScroll) {
        // when done adjusting window scroll, call showBubble helper fn
        if (adjustScroll) {
          adjustWindowScroll(showBubble);
        }
        else {
          showBubble();
        }

        // If we want to advance to next step when user clicks on target.
        if (step.nextOnTargetClick) {
          utils.addEvtListener(targetEl, 'click', targetClickNextFn);
        }
      });

      utils.setState(getOption('cookieName'), cookieVal, 1);
    },

    /**
     * init
     *
     * Initializes the Hopscotch object.
     *
     * @private
     */
    init = function(initOptions) {
      if (initOptions) {
        //initOptions.cookieName = initOptions.cookieName || 'hopscotch.tour.state';
        this.configure(initOptions);
      }
    };

    /**
     * getCalloutManager
     *
     * Gets the callout manager.
     *
     * @returns {Object} HopscotchCalloutManager
     *
     */
    this.getCalloutManager = function() {
      if (typeof calloutMgr === undefinedStr) {
        calloutMgr = new HopscotchCalloutManager();
      }

      return calloutMgr;
    };

    /**
     * startTour
     *
     * Begins the tour.
     *
     * @param {Object} tour The tour JSON object
     * @stepNum {Number} stepNum __Optional__ The step number to start from
     * @returns {Object} Hopscotch
     *
     */
    this.startTour = function(tour, stepNum) {
      var bubble,
          self = this;

      // loadTour if we are calling startTour directly. (When we call startTour
      // from window onLoad handler, we'll use currTour)
      if (!currTour) {
        currTour = tour;
        loadTour.call(this, tour);
      }

      if (typeof stepNum !== undefinedStr) {
        if (stepNum >= currTour.steps.length) {
          throw 'Specified step number out of bounds.';
        }
        currStepNum = stepNum;
      }

      // If document isn't ready, wait for it to finish loading.
      // (so that we can calculate positioning accurately)
      if (!utils.documentIsReady()) {
        waitingToStart = true;
        return this;
      }

      if (!currStepNum && currTour.id === cookieTourId && typeof cookieTourStep !== undefinedStr) {
        currStepNum = cookieTourStep;
      }
      else if (!currStepNum) {
        currStepNum = 0;
      }

      // Find the current step we should begin the tour on, and then actually start the tour.
      findStartingStep(currStepNum, function(stepNum) {
        var target = (stepNum !== -1) && utils.getStepTarget(currTour.steps[stepNum]);

        if (!target) {
          // Should we trigger onEnd callback? Let's err on the side of caution
          // and not trigger it. Don't want weird stuff happening on a page that
          // wasn't meant for the tour. Up to the developer to fix their tour.
          self.endTour(false, false);
          return;
        }

        utils.invokeEventCallbacks('start');

        bubble = getBubble();
        // TODO: do we still need this call to .hide()? No longer using opt.animate...
        // Leaving it in for now to play it safe
        bubble.hide(false); // make invisible for boundingRect calculations when opt.animate == true

        self.isActive = true;

        if (!utils.getStepTarget(getCurrStep())) {
          // First step element doesn't exist
          utils.invokeEventCallbacks('error');
          if (getOption('skipIfNoElement')) {
            self.nextStep(false);
          }
        }
        else {
          self.showStep(stepNum);
        }
      });

      return this;
    };

    /**
     * showStep
     *
     * Skips to a specific step and renders the corresponding bubble.
     *
     * @stepNum {Number} stepNum The step number to show
     * @returns {Object} Hopscotch
     */
    this.showStep = function(stepNum) {
      var step = currTour.steps[stepNum];
      if (step.delay) {
        setTimeout(function() {
          showStepHelper(stepNum);
        }, step.delay);
      }
      else {
        showStepHelper(stepNum);
      }
      return this;
    };

    /**
     * prevStep
     *
     * Jump to the previous step.
     *
     * @param {Boolean} doCallbacks Flag for invoking onPrev callback. Defaults to true.
     * @returns {Object} Hopscotch
     */
    this.prevStep = function(doCallbacks) {
      changeStep.call(this, doCallbacks, -1);
      return this;
    };

    /**
     * nextStep
     *
     * Jump to the next step.
     *
     * @param {Boolean} doCallbacks Flag for invoking onNext callback. Defaults to true.
     * @returns {Object} Hopscotch
     */
    this.nextStep = function(doCallbacks) {
      var step = getCurrStep(),
          targetEl = utils.getStepTarget(step);

      if (step.nextOnTargetClick) {
        // Detach the listener after we've clicked on the target OR the next button.
        utils.removeEvtListener(targetEl, 'click', targetClickNextFn);
      }
      changeStep.call(this, doCallbacks, 1);
      return this;
    };

    /**
     * endTour
     *
     * Cancels out of an active tour.
     *
     * @param {Boolean} clearState Flag for clearing state. Defaults to true.
     * @param {Boolean} doCallbacks Flag for invoking 'onEnd' callbacks. Defaults to true.
     * @returns {Object} Hopscotch
     */
    this.endTour = function(clearState, doCallbacks) {
      var bubble     = getBubble();
      clearState     = utils.valOrDefault(clearState, true);
      doCallbacks    = utils.valOrDefault(doCallbacks, true);
      currStepNum    = 0;
      cookieTourStep = undefined;

      bubble.hide();
      if (clearState) {
        utils.clearState(getOption('cookieName'));
      }
      if (this.isActive) {
        this.isActive = false;

        if (currTour && doCallbacks) {
          utils.invokeEventCallbacks('end');
        }
      }

      this.removeCallbacks(null, true);
      this.resetDefaultOptions();

      currTour = null;

      return this;
    };

    /**
     * getCurrTour
     *
     * @return {Object} The currently loaded tour.
     */
    this.getCurrTour = function() {
      return currTour;
    };

    /**
     * getCurrStepNum
     *
     * @return {number} The current zero-based step number.
     */
    this.getCurrStepNum = function() {
      return currStepNum;
    };

    /**
     * listen
     *
     * Adds a callback for one of the event types. Valid event types are:
     *
     * @param {string} evtType "start", "end", "next", "prev", "show", "close", or "error"
     * @param {Function} cb The callback to add.
     * @param {Boolean} isTourCb Flag indicating callback is from a tour definition.
     *    For internal use only!
     * @returns {Object} Hopscotch
     */
    this.listen = function(evtType, cb, isTourCb) {
      if (evtType) {
        callbacks[evtType].push({ cb: cb, fromTour: isTourCb });
      }
      return this;
    };

    /**
     * unlisten
     *
     * Removes a callback for one of the event types, e.g. 'start', 'next', etc.
     *
     * @param {string} evtType "start", "end", "next", "prev", "show", "close", or "error"
     * @param {Function} cb The callback to remove.
     * @returns {Object} Hopscotch
     */
    this.unlisten = function(evtType, cb) {
      var evtCallbacks = callbacks[evtType],
          i,
          len;

      for (i = 0, len = evtCallbacks.length; i < len; ++i) {
        if (evtCallbacks[i] === cb) {
          evtCallbacks.splice(i, 1);
        }
      }
      return this;
    };

    /**
     * removeCallbacks
     *
     * Remove callbacks for hopscotch events. If tourOnly is set to true, only
     * removes callbacks specified by a tour (callbacks set by external calls
     * to hopscotch.configure or hopscotch.listen will not be removed). If
     * evtName is null or undefined, callbacks for all events will be removed.
     *
     * @param {string} evtName Optional Event name for which we should remove callbacks
     * @param {boolean} tourOnly Optional flag to indicate we should only remove callbacks added
     *    by a tour. Defaults to false.
     * @returns {Object} Hopscotch
     */
    this.removeCallbacks = function(evtName, tourOnly) {
      var cbArr,
          i,
          len,
          evt;

      // If evtName is null or undefined, remove callbacks for all events.
      for (evt in callbacks) {
        if (!evtName || evtName === evt) {
          if (tourOnly) {
            cbArr = callbacks[evt];
            for (i=0, len=cbArr.length; i < len; ++i) {
              if (cbArr[i].fromTour) {
                cbArr.splice(i--, 1);
                --len;
              }
            }
          }
          else {
            callbacks[evt] = [];
          }
        }
      }
      return this;
    };

    /**
     * registerHelper
     * ==============
     * Registers a helper function to be used as a callback function.
     *
     * @param {String} id The id of the function.
     * @param {Function} id The callback function.
     */
    this.registerHelper = function(id, fn) {
      if (typeof id === 'string' && typeof fn === 'function') {
        helpers[id] = fn;
      }
    };

    this.unregisterHelper = function(id) {
      helpers[id] = null;
    };

    this.invokeHelper = function(id) {
      var args = [],
          i,
          len;

      for (i = 1, len = arguments.length; i < len; ++i) {
        args.push(arguments[i]);
      }
      if (helpers[id]) {
        helpers[id].call(null, args);
      }
    };

    /**
     * setCookieName
     *
     * Sets the cookie name (or sessionStorage name, if supported) used for multi-page
     * tour persistence.
     *
     * @param {String} name The cookie name
     * @returns {Object} Hopscotch
     */
    this.setCookieName = function(name) {
      opt.cookieName = name;
      return this;
    };

    /**
     * resetDefaultOptions
     *
     * Resets all configuration options to default.
     *
     * @returns {Object} Hopscotch
     */
    this.resetDefaultOptions = function() {
      opt = {};
      return this;
    };

    /**
     * resetDefaultI18N
     *
     * Resets all i18n.
     *
     * @returns {Object} Hopscotch
     */
    this.resetDefaultI18N = function() {
      customI18N = {};
      return this;
    };

    /**
     * hasState
     *
     * Returns state from a previous tour run, if it exists.
     *
     * @returns {String} State of previous tour run, or empty string if none exists.
     */
    this.getState = function() {
      return utils.getState(getOption('cookieName'));
    };

    /**
     * _configure
     *
     * @see this.configure
     * @private
     * @param options
     * @param {Boolean} isTourOptions Should be set to true when setting options from a tour definition.
     */
    _configure = function(options, isTourOptions) {
      var bubble,
          events = ['next', 'prev', 'start', 'end', 'show', 'error', 'close'],
          eventPropName,
          callbackProp,
          i,
          len;

      if (!opt) {
        this.resetDefaultOptions();
      }

      utils.extend(opt, options);

      if (options) {
        utils.extend(customI18N, options.i18n);
      }

      for (i = 0, len = events.length; i < len; ++i) {
        // At this point, options[eventPropName] may have changed from an array
        // to a function.
        eventPropName = 'on' + events[i].charAt(0).toUpperCase() + events[i].substring(1);
        if (options[eventPropName]) {
          this.listen(events[i],
                      options[eventPropName],
                      isTourOptions);
        }
      }

      bubble = getBubble(true);

      return this;
    };

    /**
     * configure
     *
     * <pre>
     * VALID OPTIONS INCLUDE...
     *
     * - bubbleWidth:     Number   - Default bubble width. Defaults to 280.
     * - bubblePadding:   Number   - Default bubble padding. Defaults to 15.
     * - smoothScroll:    Boolean  - should the page scroll smoothly to the next
     *                               step? Defaults to TRUE.
     * - scrollDuration:  Number   - Duration of page scroll. Only relevant when
     *                               smoothScroll is set to true. Defaults to
     *                               1000ms.
     * - scrollTopMargin: NUMBER   - When the page scrolls, how much space should there
     *                               be between the bubble/targetElement and the top
     *                               of the viewport? Defaults to 200.
     * - showCloseButton: Boolean  - should the tour bubble show a close (X) button?
     *                               Defaults to TRUE.
     * - showPrevButton:  Boolean  - should the bubble have the Previous button?
     *                               Defaults to FALSE.
     * - showNextButton:  Boolean  - should the bubble have the Next button?
     *                               Defaults to TRUE.
     * - arrowWidth:      Number   - Default arrow width. (space between the bubble
     *                               and the targetEl) Used for bubble position
     *                               calculation. Only use this option if you are
     *                               using your own custom CSS. Defaults to 20.
     * - skipIfNoElement  Boolean  - If a specified target element is not found,
     *                               should we skip to the next step? Defaults to
     *                               TRUE.
     * - onNext:          Function - A callback to be invoked after every click on
     *                               a "Next" button.
     *
     * - i18n:            Object   - For i18n purposes. Allows you to change the
     *                               text of button labels and step numbers.
     * - i18n.stepNums:   Array\<String\> - Provide a list of strings to be shown as
     *                               the step number, based on index of array. Unicode
     *                               characters are supported. (e.g., ['&#x4e00;',
     *                               '&#x4e8c;', '&#x4e09;']) If there are more steps
     *                               than provided numbers, Arabic numerals
     *                               ('4', '5', '6', etc.) will be used as default.
     * // =========
     * // CALLBACKS
     * // =========
     * - onNext:          Function - Invoked after every click on a "Next" button.
     * - onPrev:          Function - Invoked after every click on a "Prev" button.
     * - onStart:         Function - Invoked when the tour is started.
     * - onEnd:           Function - Invoked when the tour ends.
     * - onClose:         Function - Invoked when the user closes the tour before finishing.
     * - onError:         Function - Invoked when the specified target element doesn't exist on the page.
     *
     * // ====
     * // I18N
     * // ====
     * i18n:              OBJECT      - For i18n purposes. Allows you to change the text
     *                                  of button labels and step numbers.
     * i18n.nextBtn:      STRING      - Label for next button
     * i18n.prevBtn:      STRING      - Label for prev button
     * i18n.doneBtn:      STRING      - Label for done button
     * i18n.skipBtn:      STRING      - Label for skip button
     * i18n.closeTooltip: STRING      - Text for close button tooltip
     * i18n.stepNums:   ARRAY<STRING> - Provide a list of strings to be shown as
     *                                  the step number, based on index of array. Unicode
     *                                  characters are supported. (e.g., ['&#x4e00;',
     *                                  '&#x4e8c;', '&#x4e09;']) If there are more steps
     *                                  than provided numbers, Arabic numerals
     *                                  ('4', '5', '6', etc.) will be used as default.
     * </pre>
     *
     * @example hopscotch.configure({ scrollDuration: 1000, scrollTopMargin: 150 });
     * @example
     * hopscotch.configure({
     *   scrollTopMargin: 150,
     *   onStart: function() {
     *     alert("Have fun!");
     *   },
     *   i18n: {
     *     nextBtn: 'Forward',
     *     prevBtn: 'Previous'
     *     closeTooltip: 'Quit'
     *   }
     * });
     *
     * @param {Object} options A hash of configuration options.
     * @returns {Object} Hopscotch
     */
    this.configure = function(options) {
      return _configure.call(this, options, false);
    };

    init.call(this, initOptions);
  };

  winHopscotch = new Hopscotch();
  context[namespace] = winHopscotch;
}(window, 'hopscotch'));
