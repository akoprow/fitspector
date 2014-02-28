angular.module('fitspector').run(['$templateCache', function($templateCache) {

  $templateCache.put('views/compare.html',
    "<p>Comparison with friends coming soon...</p>"
  );


  $templateCache.put('views/directives/distance.html',
    "<span class=\"workout-distance\"><icon ng-hide=\"noIcon\" type=\"distance\"></icon><span ng-bind=\"value | workoutDistance\"></span><span class=\"unit\">km</span></span>"
  );


  $templateCache.put('views/directives/elevation.html',
    "<span class=\"workout-elevation\"><icon ng-hide=\"noIcon\" type=\"elevation\"></icon><span ng-bind=\"value | workoutElevation\"></span><span class=\"unit\">m</span></span>"
  );


  $templateCache.put('views/directives/hr.html',
    "<span class=\"workout-hr\" ng-show=\"value\"><icon ng-hide=\"noIcon\" type=\"hr\"></icon><span ng-bind=\"value\"></span><span class=\"unit\">bpm</span></span>"
  );


  $templateCache.put('views/directives/import-status.html',
    "<div class=\"import-status\"><div ng-show=\"importStatus.type == 'inprogress'\" class=\"alert alert-info\"><p>Synchronizing your workouts...</p><p><i>(imported <strong ng-bind=\"importStatus.imported\"></strong> new workouts)</i></p><div class=\"progress progress-striped active info\"><div class=\"progress-bar\" role=\"progressbar\" aria-valuenow=\"{{importStatus.imported}}\" aria-valuemin=\"0\" aria-valuemax=\"{{importStatus.total}}\" style=\"width: {{importStatus.importProgress}}%\"><span class=\"sr-only\">{{importProgress}}% Complete</span></div></div></div><div ng-show=\"importStatus.type == 'finished' && importStatus.done\" class=\"alert alert-success alert-dismissable\"><button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-hidden=\"true\" ng-click=\"close()\">&times;</button> Successfully imported <strong>{{importStatus.done}} workouts</strong>.</div></div>"
  );


  $templateCache.put('views/directives/intensity.html',
    "<span class=\"workout-intensity\" ng-hide=\"intensity.isZero()\"><icon ng-hide=\"noIcon\" type=\"intensity\"></icon><span ng-bind=\"value | workoutIntensity\"></span><span class=\"unit\">pts</span></span>"
  );


  $templateCache.put('views/directives/number-watchers.html',
    "<div>Number of watchers in the page: {{getNumWatchers()}}</div>"
  );


  $templateCache.put('views/directives/pace.html',
    "<span class=\"workout-pace\" ng-show=\"value\"><icon ng-hide=\"noIcon\" type=\"pace\"></icon><span ng-show=\"showPaceAsMinKm\"><span ng-bind=\"value.asTimePerKm() | workoutTime: 'short'\"></span> <span class=\"unit\">min/km</span></span> <span ng-hide=\"showPaceAsMinKm\"><span ng-bind=\"value.asKmPerHour() | number: 1\"></span> <span class=\"unit\">km/h</span></span></span>"
  );


  $templateCache.put('views/directives/screen-size.html',
    "<div><span>Current screen size:</span> <span class=\"visible-lg\">Large</span> <span class=\"visible-md\">Medium</span> <span class=\"visible-sm\">Small</span> <span class=\"visible-xs\">Extra small</span></div>"
  );


  $templateCache.put('views/directives/sorting-ctrl.html',
    "<span class=\"sorting-ctrls\"><span ng-show=\"selected == this\" class=\"glyphicon glyphicon-sort-by-attributes\"></span> <span ng-show=\"selected == '-' + this\" class=\"glyphicon glyphicon-sort-by-attributes-alt\"></span> <span ng-hide=\"selected == this || selected == '-' + this\" class=\"glyphicon glyphicon-sort-by-attributes-alt invisible\"></span></span>"
  );


  $templateCache.put('views/directives/sport-icon.html',
    "<div bindonce=\"exerciseType\" bo-class=\"'sport-icon-container bg-for-' + exerciseType.id\" rel=\"tooltip\" data-toggle=\"tooltip\" data-title=\"{{exerciseType.name}}\" ng-style=\"{'background-color': exerciseType.color}\"><div bo-class=\"'sport-icon sport-' + exerciseType.id\"></div></div>"
  );


  $templateCache.put('views/directives/steepness.html',
    "<span class=\"workout-steepness\" ng-show=\"value\"><span ng-bind=\"value | workoutDistance: 'meters'\"></span><span class=\"unit\">m/km</span></span>"
  );


  $templateCache.put('views/directives/time.html',
    "<span class=\"workout-time\"><icon ng-hide=\"noIcon\" type=\"time\"></icon><span ng-bind=\"value | workoutTime\"></span></span>"
  );


  $templateCache.put('views/directives/workout-distance-gauge.html',
    "<div class=\"progress pace\" ng-hide=\"distance.getTotal().isZero()\" ng-style=\"{width: distance.gaugePercent(maxGaugeDistance)}\"><div bindonce=\"\" ng-repeat=\"i in [0, 1, 2, 3, 4, 5, 6]\" bo-style=\"{width: distance.zonePercent(i)}\" class=\"progress-bar progress-bar-z{{i}}\"></div></div>"
  );


  $templateCache.put('views/directives/workout-gauge.html',
    "<div ng-show=\"zones\" bindonce=\"type\" bo-class=\"'gauge ' + type\"><div class=\"progress\" bo-style=\"{'width': zones.gaugePercent(gaugeMax)}\"><div bindonce=\"\" ng-repeat=\"i in [0, 1, 2, 3, 4, 5, 6]\" bo-style=\"{'width': zones.zonePercent(i)}\" bo-class=\"'progress-bar progress-bar-z' + i\"></div></div><div class=\"multiplier\"><span bo-show=\"zones.gaugeMultiplicator(gaugeMax)\" class=\"label label-default\"><span bo-text=\"zones.gaugeMultiplicator(gaugeMax)\"></span>x</span></div></div>"
  );


  $templateCache.put('views/directives/workouts-summary-by-sport.html',
    "<div class=\"sport-summary\"><table><tr class=\"icon\"><th></th><td class=\"data\"><a class=\"unfilter\" ng-show=\"sportFilter != 'all'\" ng-click=\"setSportFilter('all')\">(Click to show all sports)</a> <span ng-repeat=\"sport in sports track by sport.exerciseType.id\" ng-mouseover=\"setActiveColumn($index)\" ng-mouseout=\"setActiveColumn(-1)\" class=\"sport-summary-value\" ng-style=\"{ 'left': elementWidth * $index }\" ng-click=\"setSportFilter(sport.exerciseType.id)\"><sport-icon no-tooltip=\"true\" exercise-type=\"sport.exerciseType\"></sport-icon></span></td></tr><tr bindonce=\"\" ng-repeat=\"metric in ['Sessions', 'Time', 'Distance', 'Elevation']\" class=\"data-row\"><th><span class=\"text\"><span class=\"hidden-xs\" bo-text=\"metric\"></span><icon type=\"{{metric | lowercase}}\"></icon></span></th><td class=\"data\"><span ng-repeat=\"sport in sports\" ng-mouseover=\"setActiveColumn($index)\" ng-mouseout=\"setActiveColumn(-1)\" class=\"sport-summary-value\" ng-style=\"{ 'left': elementWidth * $index, 'background-color': activeColumn == $index ? sport.exerciseType.color : sport.exerciseType.bgColor }\"><span ng-switch=\"metric | lowercase\"><span ng-switch-when=\"sessions\"><span ng-bind=\"sport.sessions\"></span><span class=\"unit\">x</span></span><time ng-switch-when=\"time\" no-icon=\"true\" value=\"sport.totalDuration\"></time><distance ng-switch-when=\"distance\" no-icon=\"true\" value=\"sport.totalDistance\"></distance><elevation ng-switch-when=\"elevation\" no-icon=\"true\" value=\"sport.totalElevation\"></elevation></span></span></td></tr></table></div>"
  );


  $templateCache.put('views/home.html',
    "<div class=\"home\"><div class=\"carousel slide\" data-ride=\"carousel\"><div class=\"carousel-inner\"><div class=\"item active\"><img src=\"/images/stopwatch.jpg\"><div class=\"container\"><div class=\"carousel-caption visible-md visible-lg\"><h1>Welcome to Fitspector!</h1><p>Fitspector is a service built to help sport enthusiasts better understand their workout data.</p><p>Currently we are in private Beta.<br>If you are interested in trying it out please<br><a href=\"http://blog.fitspector.com/post/74659062274/private-beta\">click here</a> to learn more.</p><p>If you already have access go ahead and <a href=\"/login\">log-in</a>.</p></div></div></div></div></div><div class=\"alert alert-success visible-xs visible-sm\"><h1>Welcome to Fitspector!</h1><p>Fitspector is a service built to help sport enthusiasts better understand their workout data.</p><p>Currently we are in private Beta. If you are interested in trying it out please <a href=\"http://blog.fitspector.com/post/74659062274/private-beta\">click here</a> to learn more.</p><p>If you already have access go ahead and <a href=\"/login\">log-in</a>.</p></div><div class=\"alert alert-info\" id=\"mc_embed_signup\"><h3 class=\"text-center\">Subscribe to our mailing list for updates:</h3><form action=\"http://fitspector.us7.list-manage.com/subscribe/post?u=680fae86b2a098eec071ae350&amp;id=42a462a6da\" method=\"post\" class=\"form-inline subscribe-form\" role=\"form\" novalidate id=\"mc-embedded-subscribe-form\" name=\"mc-embedded-subscribe-form\" class=\"validate\"><div class=\"email-input\"><label class=\"sr-only\" for=\"mce-EMAIL\">Your email for Fitspector's mailing list subscription</label><input type=\"email\" name=\"EMAIL\" class=\"form-control input-lg\" id=\"mce-EMAIL\" placeholder=\"Your email address\" required></div><div style=\"position: absolute; left: -5000px\"><input name=\"b_680fae86b2a098eec071ae350_42a462a6da\"></div><button type=\"submit\" value=\"Subscribe\" name=\"subscribe\" id=\"mc-embedded-subscribe\" class=\"btn btn-lg btn-success\">Subscribe</button></form></div><script src=\"https://apis.google.com/js/plusone.js\"></script><div class=\"google-plus-badge\"><div class=\"g-page\" data-href=\"https://plus.google.com/115638171785797148025\" data-layout=\"landscape\" data-showtagline=\"true\" data-width=\"320\"></div></div></div>"
  );


  $templateCache.put('views/login.html',
    "<div class=\"jumbotron\"><div class=\"container\"><h2>Login</h2><p><span class=\"glyphicon glyphicon-warning-sign\"></span> Please note that currently Fitspector is in private beta and access is restricted to approved users only.</p><p>If you want to try the service <a href=\"http://blog.fitspector.com/post/74659062274/private-beta\">learn here</a> how to apply for access.</p><p>If you were already granted access just login with your RunKeeper account below.</p><a href=\"\" ng-click=\"loginRunKeeper()\"><img src=\"http://static1.runkeeper.com/images/assets/login-blue-black-200x38.png\"></a></div></div>"
  );


  $templateCache.put('views/loginFailed.html',
    "<div class=\"alert alert-danger\"><strong>Login failed.</strong><br><p>Fitspector is in private beta and access is restricted to approved users. Learn <a href=\"http://blog.fitspector.com/post/74659062274/private-beta\">here</a> how to apply for access</p><p>If you believe you should not be seeing this message please contact us at <a href=\"mailto: beta@fitspector.com\">beta@fitspector.com</a>.</p></div>"
  );


  $templateCache.put('views/topbar.html',
    "<div class=\"navbar navbar-inverse navbar-fixed-top\" role=\"navigation\" ng-controller=\"NavigationCtrl\"><div class=\"container\"><a class=\"logo\" href=\"/\"><img src=\"/images/logo.png\"></a><div class=\"navbar-header\"><button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\".navbar-collapse\"><span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span></button></div><div class=\"navbar-collapse collapse\"><ul class=\"nav navbar-nav\"><li ng-class=\"{active: isAt('workouts')}\"><a href=\"/workouts\"><span class=\"glyphicon glyphicon-list-alt\"></span> Workout log</a></li></ul><ul class=\"nav navbar-nav navbar-right\"><li><a href=\"http://blog.fitspector.com\" target=\"_blank\">Blog</a></li><li access-level=\"guest\" ng-class=\"{active: isAt('login')}\"><a href=\"/login\"><span class=\"glyphicon glyphicon-log-in\"></span> Login</a></li><li access-level=\"user\"><a href=\"#\" ng-click=\"logout()\" class=\"visible-xs-sm\"><span class=\"glyphicon glyphicon-off\"></span> Logout</a></li><li access-level=\"user\" class=\"disabled hidden-xs hidden-sm\"><a href=\"#\"><span class=\"user-name\" ng-bind=\"getUser().name\"></span></a></li><li access-level=\"user\" class=\"hidden-xs hidden-sm\"><a href=\"#\" class=\"dropdown-toggle user-toggle\" data-toggle=\"dropdown\"><img ng-show=\"getUser().smallImgUrl\" class=\"img-rounded user-icon\" ng-src=\"{{getUser().smallImgUrl}}\"> <span ng-hide=\"getUser().smallImgUrl\" class=\"glyphicon glyphicon-user user-icon\"></span> <b class=\"caret\"></b></a><ul class=\"dropdown-menu\"><li><a href=\"#\" ng-click=\"logout()\"><span class=\"glyphicon glyphicon-off\"></span> Logout</a></li></ul></li></ul></div></div></div>"
  );


  $templateCache.put('views/workouts.html',
    "<div class=\"workouts\" infinite-scroll=\"scrollWorkouts()\"><div class=\"panel panel-default\"><div class=\"panel-heading\"><h3 class=\"panel-title\">Your workouts</h3></div><div class=\"panel-body\"><div class=\"btn-toolbar\"><div class=\"btn-group time-ctrls\"><button class=\"btn btn-primary\" bindonce=\"\" ng-repeat=\"mode in timeModes\" ng-class=\"{active: timeMode.id == mode.id}\" ng-click=\"setTimeMode(mode.id)\" bo-text=\"mode.desc\"></button></div><div class=\"btn-group gauge-modes\"><button class=\"btn btn-primary\" bindonce=\"\" ng-repeat=\"mode in gaugeModes\" ng-class=\"{active: gaugeSettings.mode == mode.id}\" ng-click=\"gaugeSettings.mode = mode.id\" bo-text=\"mode.desc\"></button></div><div class=\"filter\"><form class=\"form-inline\"><div class=\"input-group\"><input type=\"search\" class=\"form-control\" ng-model=\"q\" placeholder=\"Filter workouts...\"><span class=\"input-group-btn\"><button class=\"btn btn-primary\" type=\"button\" ng-click=\"q = ''\"><span class=\"glyphicon glyphicon-remove\"></span></button></span></div></form></div></div></div><div class=\"text-center date-selection\"><div class=\"btn-group\"><button type=\"button\" class=\"btn btn-primary\" ng-class=\"{disabled: prevDisabled() || timeMode.id == 'all'}\" ng-click=\"prev()\"><span class=\"glyphicon glyphicon-chevron-left\"></span></button> <button type=\"button\" class=\"btn btn-primary\" ng-click=\"goNow()\" ng-bind=\"timeMode.desc\"></button> <button type=\"button\" class=\"btn btn-primary\" ng-class=\"{disabled: nextDisabled()  || timeMode.id == 'all'}\" ng-click=\"next()\"><span class=\"glyphicon glyphicon-chevron-right\"></span></button></div><div><small ng-bind=\"timeMode.fullDesc\"></small></div></div><ul class=\"list-group\"><li class=\"list-group-item\" ng-show=\"sportFilter != 'all' || visibleWorkouts\"><workouts-summary-by-sport workouts=\"visibleWorkouts\" query-filter=\"q\" sport-filter-listener=\"setSportFilter(exerciseTypeId)\"></workouts-summary-by-sport></li></ul><table class=\"workouts table gauge-mode-{{gaugeSettings.mode}}\"><tr ng-hide=\"visibleWorkouts\"><td class=\"text-center\">No <strong ng-if=\"sportFilter != 'all'\" ng-bind=\"getFilteredSportName()\"></strong> workouts in the selected time period.</td></tr><tr class=\"workout header\" ng-show=\"visibleWorkouts\"><th><div class=\"workout-info\"><div class=\"date-and-time\"><span class=\"sortHandler\" ng-click=\"orderBy('startTime')\">Date</span><sorting-ctrl this=\"startTime\" selected></sorting-ctrl></div><div class=\"sport-icon\"><span class=\"sortHandler\" ng-click=\"orderBy('exerciseType.id')\">Sport</span><sorting-ctrl this=\"exerciseType.id\" selected></sorting-ctrl></div><div class=\"labels-and-note\"><span>Labels & notes</span></div></div><div class=\"workout-gauges\"><div class=\"time-and-hr\"><div class=\"pull-left\"><span class=\"sortHandler\" ng-click=\"orderBy('totalDuration.asSeconds()')\">Duration</span><sorting-ctrl this=\"totalDuration.asSeconds()\" selected></sorting-ctrl></div><div class=\"pull-right\"><span class=\"sortHandler\" ng-click=\"orderBy('avgHR')\">HR (avg)</span><sorting-ctrl this=\"avgHR\" selected></sorting-ctrl></div></div><div class=\"distance-and-pace\"><div class=\"pull-left\"><span class=\"sortHandler\" ng-click=\"orderBy('totalDistance.asMeters()')\">Distance</span><sorting-ctrl this=\"totalDistance.asMeters()\" selected></sorting-ctrl></div><div class=\"pull-right\"><span class=\"sortHandler\" ng-click=\"orderBy('pace.asTimePerKm().asSeconds()')\">Pace (avg)</span><sorting-ctrl this=\"pace.asTimePerKm().asSeconds()\" selected></sorting-ctrl></div></div><div class=\"elevation-and-steepness\"><div class=\"pull-left\"><span class=\"sortHandler\" ng-click=\"orderBy('totalElevation.asMeters()')\">Elevation</span><sorting-ctrl this=\"totalElevation.asMeters()\" selected></sorting-ctrl></div><div class=\"pull-right\"><span class=\"sortHandler\" ng-click=\"orderBy('steepness.asMeters()')\">Steepness</span><sorting-ctrl this=\"steepness.asMeters()\" selected></sorting-ctrl></div></div></div></th></tr><tr bindonce=\"workout\" ng-repeat=\"workout in visibleWorkouts | filter: q | orderBy: order | limitTo: infiniteScrollingPosition track by workout.id\" class=\"workout\" ng-style=\"{'background-color': workout.exerciseType.bgColor}\" ng-mouseover=\"gaugeSettings.selectedWorkout = workout.id\" ng-mouseout=\"gaugeSettings.selectedWorkout = ''\"><td><div class=\"workout-info\"><div class=\"details\"><a ng-show=\"workout.detailsUrl()\" class=\"btn btn-primary btn-xs\" bo-href=\"workout.detailsUrl()\" target=\"_blank\" rel=\"tooltip\" data-toggle=\"tooltip\" data-delay=\"500\" title=\"Show workout details in RunKeeper (opens in a new window)\"><span class=\"glyphicon glyphicon-zoom-in\"></span></a></div><div class=\"date-and-time\"><div class=\"date\" bo-text=\"workout.startTime | date\"></div><div class=\"time\" bo-text=\"workout.startTime | time\"></div></div><div class=\"sport-icon\"><sport-icon exercise-type=\"workout.exerciseType\"></sport-icon></div><div class=\"labels-and-note\"><div bindonce=\"\" ng-repeat=\"label in workout.labels\" class=\"label label-primary\" bo-text=\"label\"></div><div class=\"notes\" bo-text=\"workout.notes\"></div></div></div><div class=\"workout-gauges\"><div class=\"time-and-hr\"><div class=\"numbers\"><time value=\"workout.totalDuration\"></time><hr class=\"pull-right\" value=\"workout.avgHR\"></div><div class=\"gauge\"><workout-gauge type=\"hr\" zones=\"workout.hrZones\" gauge-max=\"maxGaugeTime\"></workout-gauge></div></div><div class=\"distance-and-pace\"><div class=\"numbers\"><distance ng-hide=\"workout.totalDistance.isZero()\" value=\"workout.totalDistance\"></distance><pace class=\"pull-right\" value=\"workout.pace\" exercise-type=\"workout.exerciseType\"></pace></div><div class=\"gauge\"><workout-gauge type=\"pace\" zones=\"workout.paceZones\" gauge-max=\"maxGaugeDistance\"></workout-gauge></div></div><div class=\"elevation-and-steepness\"><div class=\"numbers\"><elevation ng-hide=\"workout.totalElevation.isZero()\" value=\"workout.totalElevation\"></elevation><steepness class=\"pull-right\" value=\"workout.steepness\"></steepness></div><div class=\"gauge\"><workout-gauge type=\"elevation\" zones=\"workout.elevationZones\" gauge-max=\"maxGaugeDistance\"></workout-gauge></div></div></div></td></tr></table></div></div>"
  );

}]);
