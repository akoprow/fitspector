angular.module('fitspector').run(['$templateCache', function($templateCache) {

  $templateCache.put('views/compare.html',
    "<p>Comparison with friends coming soon...</p>"
  );


  $templateCache.put('views/directives/distance.html',
    "<span class=\"workout-distance\" ng-show=\"value\"><icon ng-hide=\"noIcon\" type=\"distance\"></icon><span ng-bind=\"value | workoutDistance\"></span><span class=\"unit\">km</span></span>"
  );


  $templateCache.put('views/directives/elevation.html',
    "<span class=\"workout-elevation\" ng-show=\"value && !value.isZero()\"><icon ng-hide=\"noIcon\" type=\"elevation\"></icon><span ng-bind=\"value | workoutElevation\"></span><span class=\"unit\">m</span></span>"
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


  $templateCache.put('views/directives/sorting-ctrl.html',
    "<span class=\"sorting-ctrls\"><span ng-show=\"selected == this\" class=\"glyphicon glyphicon-sort-by-attributes\"></span> <span ng-show=\"selected == '-' + this\" class=\"glyphicon glyphicon-sort-by-attributes-alt\"></span> <span ng-hide=\"selected == this || selected == '-' + this\" class=\"glyphicon glyphicon-sort-by-attributes-alt invisible\"></span></span>"
  );


  $templateCache.put('views/directives/sport-icon.html',
    "<div bindonce=\"exerciseType\" bo-class=\"'sport-icon-container bg-for-' + exerciseType.id\" rel=\"tooltip\" data-toggle=\"tooltip\" data-title=\"{{exerciseType.name}}\"><div bo-class=\"'sport-icon sport-' + exerciseType.id\"></div></div>"
  );


  $templateCache.put('views/directives/steepness.html',
    "<span class=\"workout-steepness\" ng-show=\"value\"><span ng-bind=\"value | workoutDistance: 'meters'\"></span><span class=\"unit\">m/km</span></span>"
  );


  $templateCache.put('views/directives/time.html',
    "<span class=\"workout-time\" ng-hide=\"value.isZero()\"><icon ng-hide=\"noIcon\" type=\"time\"></icon><span ng-bind=\"value | workoutTime\"></span></span>"
  );


  $templateCache.put('views/directives/workout-distance-gauge.html',
    "<div class=\"progress pace\" ng-hide=\"distance.getTotal().isZero()\" ng-style=\"{width: distance.gaugePercent(maxGaugeDistance)}\"><div bindonce=\"\" ng-repeat=\"i in [0, 1, 2, 3, 4, 5, 6]\" bo-style=\"{width: distance.zonePercent(i)}\" class=\"progress-bar progress-bar-z{{i}}\"></div></div>"
  );


  $templateCache.put('views/directives/workout-gauge.html',
    "<div bindonce=\"type\" bo-class=\"'gauge ' + type\"><div class=\"progress\" bo-style=\"{'width': zones.gaugePercent(gaugeMax)}\"><div bindonce=\"\" ng-repeat=\"i in [0, 1, 2, 3, 4, 5, 6]\" bo-style=\"{'width': zones.zonePercent(i)}\" bo-class=\"'progress-bar progress-bar-z' + i\"></div></div><div class=\"multiplier\"><span bo-show=\"zones.gaugeMultiplicator(gaugeMax)\" class=\"label label-default\"><span bo-text=\"zones.gaugeMultiplicator(gaugeMax)\"></span>x</span></div></div>"
  );


  $templateCache.put('views/directives/workouts-summary-by-sport.html',
    "<div class=\"sport-summary\" ng-show=\"workouts\"><table><tr class=\"icon\"><th></th><td class=\"data\"><a class=\"unfilter\" ng-show=\"sportFilter != 'all'\" ng-click=\"setSportFilter('all')\">(Click to show all sports)</a> <span ng-repeat=\"sport in sports\" ng-mouseover=\"setActiveColumn($index)\" ng-mouseout=\"setActiveColumn(-1)\" class=\"sport-summary-value\" ng-style=\"{ 'left': elementWidth * $index }\" ng-click=\"setSportFilter(sport.exerciseType)\"><sport-icon exercise-type=\"sport.exerciseType\"></sport-icon></span></td></tr><tr bindonce=\"\" ng-repeat=\"metric in ['sessions', 'time', 'distance', 'elevation']\" class=\"data-row\"><th><span class=\"text\"><span bo-text=\"metric\"></span><icon type=\"{{metric}}\"></icon></span></th><td class=\"data\"><span ng-repeat=\"sport in sports\" ng-mouseover=\"setActiveColumn($index)\" ng-mouseout=\"setActiveColumn(-1)\" class=\"sport-summary-value\" ng-class=\"{ 'bg-for-{{sport.exerciseType.id}}': activeColumn == $index }\" ng-style=\"{ 'left': elementWidth * $index }\"><span ng-switch=\"metric\"><span ng-switch-when=\"sessions\"><span ng-bind=\"sport.sessions\"></span><span class=\"unit\">x</span></span><time ng-switch-when=\"time\" no-icon=\"true\" value=\"sport.totalDuration\"></time><distance ng-switch-when=\"distance\" no-icon=\"true\" value=\"sport.totalDistance\"></distance><elevation ng-switch-when=\"elevation\" no-icon=\"true\" value=\"sport.totalElevation\"></elevation></span></span></td></tr></table></div>"
  );


  $templateCache.put('views/home.html',
    "<div class=\"home\"><div class=\"carousel slide\" data-ride=\"carousel\"><div class=\"carousel-inner\"><div class=\"item active\"><img src=\"/images/stopwatch.jpg\"><div class=\"container\"><div class=\"carousel-caption\"><h1>Welcome to Fitspector!</h1><p>Fitspector is a service built to help sport enthusiasts better understand their workout data.</p><p>Currently we are in private Beta.<br>If you are interested in trying it out please<br><a href=\"http://blog.fitspector.com/post/74659062274/private-beta\">click here</a> to learn more.</p><p>If you already have access go ahead and <a href=\"/login\">log-in</a></p></div></div></div></div></div><div class=\"alert alert-info\" id=\"mc_embed_signup\"><h3 class=\"text-center\">Subscribe to our mailing list for updates:</h3><form action=\"http://fitspector.us7.list-manage.com/subscribe/post?u=680fae86b2a098eec071ae350&amp;id=42a462a6da\" method=\"post\" class=\"form-inline row\" role=\"form\" novalidate id=\"mc-embedded-subscribe-form\" name=\"mc-embedded-subscribe-form\" class=\"validate\"><div class=\"col-md-4 col-md-offset-3\"><label class=\"sr-only\" for=\"mce-EMAIL\">Your email for Fitspector's mailing list subscription</label><input type=\"email\" name=\"EMAIL\" class=\"form-control input-lg col-md-6\" id=\"mce-EMAIL\" placeholder=\"Your email address\" required></div><div style=\"position: absolute; left: -5000px\"><input name=\"b_680fae86b2a098eec071ae350_42a462a6da\"></div><button type=\"submit\" value=\"Subscribe\" name=\"subscribe\" id=\"mc-embedded-subscribe\" class=\"btn btn-lg btn-success col-md-2\">Subscribe</button></form></div></div>"
  );


  $templateCache.put('views/login.html',
    "<div class=\"jumbotron\"><div class=\"container\"><h2>Login</h2><p><span class=\"glyphicon glyphicon-warning-sign\"></span> Please note that currently Fitspector is in private beta and access is restricted to approved users only.</p><p>If you want to try the service <a href=\"http://blog.fitspector.com/post/74659062274/private-beta\">learn here</a> how to apply for access.</p><p>If you were already granted access just login with your RunKeeper account below.</p><a href=\"\" ng-click=\"loginRunKeeper()\"><img src=\"http://static1.runkeeper.com/images/assets/login-blue-black-200x38.png\"></a></div></div>"
  );


  $templateCache.put('views/loginFailed.html',
    "<div class=\"alert alert-danger\"><strong>Login failed.</strong><br><p>Fitspector is in private beta and access is restricted to approved users. Learn <a href=\"http://blog.fitspector.com/post/74659062274/private-beta\">here</a> how to apply for access</p><p>If you believe you should not be seeing this message please contact us at <a href=\"mailto: beta@fitspector.com\">beta@fitspector.com</a>.</p></div>"
  );


  $templateCache.put('views/topbar.html',
    "<div class=\"navbar navbar-inverse navbar-fixed-top\" role=\"navigation\" ng-controller=\"NavigationCtrl\"><div class=\"container\"><a class=\"logo\" href=\"/\"><img src=\"/images/logo.png\"></a><div class=\"navbar-header\"><button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\".navbar-collapse\"><span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span> <span class=\"icon-bar\"></span></button></div><div class=\"navbar-collapse collapse\"><ul class=\"nav navbar-nav\"><li ng-class=\"{active: isAt('workouts')}\"><a href=\"/workouts\"><span class=\"glyphicon glyphicon-list-alt\"></span> Workout log</a></li></ul><ul class=\"nav navbar-nav navbar-right\"><li><a href=\"http://blog.fitspector.com\" target=\"_blank\">Blog</a></li><li access-level=\"guest\" ng-class=\"{active: isAt('login')}\"><a href=\"/login\"><span class=\"glyphicon glyphicon-log-in\"></span> Login</a></li><li access-level=\"user\" class=\"disabled\"><a href=\"#\"><span class=\"user-name\" ng-bind=\"getUser().name\"></span></a></li><li access-level=\"user\"><a href=\"#\" class=\"dropdown-toggle user-toggle\" data-toggle=\"dropdown\"><img ng-show=\"getUser().smallImgUrl\" class=\"img-rounded user-icon\" ng-src=\"{{getUser().smallImgUrl}}\"> <span ng-hide=\"getUser().smallImgUrl\" class=\"glyphicon glyphicon-user user-icon\"></span> <b class=\"caret\"></b></a><ul class=\"dropdown-menu\"><li><a href=\"#\" ng-click=\"logout()\"><span class=\"glyphicon glyphicon-off\"></span> Logout</a></li></ul></li></ul></div></div></div>"
  );


  $templateCache.put('views/workouts.html',
    "<div class=\"workouts\" infinite-scroll=\"scrollWorkouts()\"><div class=\"panel panel-default\"><div class=\"panel-heading\"><h3 class=\"panel-title\">Your workouts</h3></div><div class=\"panel-body\"><div class=\"btn-toolbar\"><div class=\"btn-group\"><button class=\"btn btn-primary\" bindonce=\"\" ng-repeat=\"mode in timeModes\" ng-class=\"{active: timeMode.id == mode.id}\" ng-click=\"setTimeMode(mode.id)\" bo-text=\"mode.desc\"></button></div><div class=\"btn-group\"><button class=\"btn btn-primary\" bindonce=\"\" ng-repeat=\"mode in gaugeModes\" ng-class=\"{active: gaugeSettings.mode == mode.id}\" ng-click=\"gaugeSettings.mode = mode.id\" bo-text=\"mode.desc\"></button></div><div class=\"col-lg-3\"><form class=\"form-inline\"><div class=\"form-group\"><div class=\"input-group\"><input type=\"search\" class=\"form-control\" ng-model=\"q\" placeholder=\"Filter workouts...\"><span class=\"input-group-btn\"><button class=\"btn btn-primary\" type=\"button\" ng-click=\"q = ''\"><span class=\"glyphicon glyphicon-remove\"></span></button></span></div></div></form></div></div></div><div class=\"text-center date-selection\" ng-hide=\"timeMode.id == 'all'\"><div class=\"btn-group\"><button type=\"button\" class=\"btn btn-primary\" ng-class=\"{disabled: prevDisabled()}\" ng-click=\"prev()\"><span class=\"glyphicon glyphicon-chevron-left\"></span></button> <button type=\"button\" class=\"btn btn-primary\" ng-click=\"goNow()\" ng-bind=\"timeMode.desc\"></button> <button type=\"button\" class=\"btn btn-primary\" ng-class=\"{disabled: nextDisabled()}\" ng-click=\"next()\"><span class=\"glyphicon glyphicon-chevron-right\"></span></button></div><div><small ng-bind=\"timeMode.fullDesc\"></small></div></div><ul class=\"list-group\"><li class=\"list-group-item\" ng-show=\"getWorkouts()\"><workouts-summary-by-sport workouts=\"getWorkouts()\" query-filter=\"q\" sport-filter-listener=\"setSportFilter(sport)\"></workouts-summary-by-sport></li></ul><table class=\"table workouts-list\"><tr ng-show=\"getWorkouts()\"><th class=\"date\"><span class=\"sortHandler\" ng-click=\"orderBy('startTime')\">Date</span><sorting-ctrl this=\"startTime\" selected></sorting-ctrl></th><th class=\"sport\"><span class=\"sortHandler\" ng-click=\"orderBy('exerciseType')\">Sport</span><sorting-ctrl this=\"exerciseType\" selected></sorting-ctrl></th><th class=\"notes-and-labels\">Notes</th><th class=\"time-label\"><span class=\"sortHandler\" ng-click=\"orderBy('totalDuration.asSeconds()')\">Time</span><sorting-ctrl this=\"totalDuration.asSeconds()\" selected></sorting-ctrl></th><th class=\"hr-label\"><span class=\"sortHandler\" ng-click=\"orderBy('avgHR')\">HR (avg)</span><sorting-ctrl this=\"avgHR\" selected></sorting-ctrl></th><th class=\"distance-label\"><span class=\"sortHandler\" ng-click=\"orderBy('totalDistance.asMeters()')\">Distance</span><sorting-ctrl this=\"totalDistance.asMeters()\" selected></sorting-ctrl></th><th class=\"pace-label\"><span class=\"sortHandler\" ng-click=\"orderBy('pace.asTimePerKm().asSeconds()')\">Pace (avg)</span><sorting-ctrl this=\"pace.asTimePerKm().asSeconds()\" selected></sorting-ctrl></th><th class=\"elevation-label\"><span class=\"sortHandler\" ng-click=\"orderBy('totalElevation.asMeters()')\">Elevation</span><sorting-ctrl this=\"totalElevation.asMeters()\" selected></sorting-ctrl></th><th class=\"steepness-label\"><span class=\"sortHandler\" ng-click=\"orderBy('steepness.asMeters()')\">Steepness</span><sorting-ctrl this=\"steepness.asMeters()\" selected></sorting-ctrl></th><th class=\"details\"></th></tr><tr ng-hide=\"workouts\"><td colspan=\"10\" class=\"text-center\" ng-hide=\"getWorkouts()\">No workouts in the selected time period.</td></tr><tr bindonce=\"\" ng-repeat=\"workout in getWorkouts() | filter: q | orderBy: order | limitTo: infiniteScrollingPosition track by workout.id\" class=\"animate-workout-list sport-{{workout.exerciseType}}\" ng-mouseover=\"gaugeSettings.selectedWorkout = workout.id\" ng-mouseout=\"gaugeSettings.selectedWorkout = ''\"><td class=\"date\"><div bo-text=\"workout.startTime | date\"></div><div bo-text=\"workout.startTime | time\"></div></td><td class=\"sport\"><sport-icon exercise-type=\"workout.exerciseType\"></sport-icon></td><td class=\"notes-and-labels\"><span bindonce=\"\" ng-repeat=\"label in workout.labels\" class=\"label label-primary\" bo-text=\"label\"></span> <span class=\"notes\" bo-text=\"workout.notes\"></span></td><td class=\"time-and-hr\" colspan=\"2\"><span ng-style=\"{visibility: gaugeSettings.mode != 'gauges' || gaugeSettings.selectedWorkout == workout.id ? 'visible' : 'hidden'}\"><time value=\"workout.totalDuration\"></time><hr value=\"workout.avgHR\"></span> <span ng-show=\"gaugeSettings.mode != 'numbers' && workout.hrZones\"><workout-gauge type=\"hr\" zones=\"workout.hrZones\" gauge-max=\"maxGaugeTime\"></workout-gauge></span></td><td class=\"distance-and-pace\" colspan=\"2\" ng-class=\"{'gauge-with-numbers': gaugeSettings.mode == 'both'}\"><span ng-style=\"{visibility: gaugeSettings.mode != 'gauges' || gaugeSettings.selectedWorkout == workout.id ? 'visible' : 'hidden'}\"><distance value=\"workout.totalDistance\"></distance><pace value=\"workout.pace\" exercise-type=\"workout.exerciseType\"></pace></span> <span ng-show=\"gaugeSettings.mode != 'numbers' && workout.paceZones\"><workout-gauge type=\"pace\" zones=\"workout.paceZones\" gauge-max=\"maxGaugeDistance\"></workout-gauge></span></td><td class=\"elevation\" colspan=\"2\" ng-class=\"{'gauge-with-numbers': gaugeSettings.mode == 'both'}\"><span ng-style=\"{visibility: gaugeSettings.mode != 'gauges' || gaugeSettings.selectedWorkout == workout.id ? 'visible' : 'hidden'}\"><elevation value=\"workout.totalElevation\"></elevation><steepness value=\"workout.steepness\"></steepness></span> <span ng-show=\"gaugeSettings.mode != 'numbers' && workout.elevationZones\"><workout-gauge type=\"elevation\" zones=\"workout.elevationZones\" gauge-max=\"maxGaugeDistance\"></workout-gauge></span></td><td class=\"details\"><a bindonce=\"workout\" bo-show=\"workout.detailsUrl()\" class=\"btn btn-primary btn-sm\" bo-href=\"workout.detailsUrl()\" target=\"_blank\"><span class=\"glyphicon glyphicon-zoom-in\"></span></a></td></tr></table></div></div>"
  );

}]);
