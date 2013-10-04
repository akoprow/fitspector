(function(){"use strict";angular.module("fitspector",["ngRoute","firebase"])}).call(this),function(){"use strict";var a,b;b="undefined"!=typeof exports&&null!==exports?exports:this,a=1e3,b.Distance=function(){function b(a){this.meters=a}return b.fromJson=function(a){return new b(a)},b.plus=function(a,c){return new b(a.meters+c.meters)},b.subtract=function(a,c){return new b(a.meters-c.meters)},b.zero=new b(0),b.ratio=function(a,b){return a.meters/b.meters},b.prototype.isZero=function(){return 0===this.meters},b.prototype.asKilometers=function(){return this.meters/a},b.prototype.asMeters=function(){return this.meters},b.prototype.subtract=function(a){return new b(this.value()-a.value())},b.prototype.value=function(){return this.asMeters()},b}()}.call(this),function(){"use strict";var a;a="undefined"!=typeof exports&&null!==exports?exports:this,a.Intensity=function(){function a(a){this.points=a}return a.fromJson=function(b){return new a(b)},a.plus=function(b,c){return new a(b.points+c.points)},a.subtract=function(b,c){return new a(b.points-c.points)},a.zero=new a(0),a.prototype.isZero=function(){return 0===this.points},a.prototype.value=function(){return this.points},a.prototype.subtract=function(b){return new a(this.value()-b.value())},a}()}.call(this),function(){"use strict";var a,b;b="undefined"!=typeof exports&&null!==exports?exports:this,a=24,b.Time=function(){function b(a){this.t=moment.duration({seconds:a})}return b.fromJson=function(a){return new b(a)},b.plus=function(a,c){return new b(a.t.asSeconds()+c.t.asSeconds())},b.zero=new b(0),b.ratio=function(a,b){return a.asSeconds()/b.asSeconds()},b.prototype.isZero=function(){return 0===this.t.asSeconds()},b.prototype.hours=function(){return this.t.hours()+a*this.t.days()},b.prototype.minutes=function(){return this.t.minutes()},b.prototype.asSeconds=function(){return this.t.asSeconds()},b.prototype.subtract=function(a){return new b(this.asSeconds()-a.asSeconds())},b.prototype.value=function(){return this.asSeconds()},b}()}.call(this),function(){"use strict";var a;a="undefined"!=typeof exports&&null!==exports?exports:this,a.Zones=function(){function a(a,b){this.zones=a,this.Unit=b}return a.fromJson=function(b,c){var d;return d=_(b).map(c.fromJson),new a(d,c)},a.prototype.zonePercent=function(a){var b,c,d;return d=this.zones[a],b=this.getTotal(),c=100*this.Unit.ratio(d,b),""+c+"%"},a.prototype.gaugePercent=function(a){var b;return b=this.Unit.ratio(this.getTotal(),a),b>1&&(b=1),""+100*b+"%"},a.prototype.getTotal=function(){return this.total||(this.total=_(this.zones).reduce(this.Unit.plus,this.Unit.zero)),this.total},a}()}.call(this),function(){"use strict";var a;a="undefined"!=typeof exports&&null!==exports?exports:this,a.Workout=function(){function a(a,b){this.startTime=a,this.exerciseType=b}return a.fromJson=function(b){var c,d,e;return d=moment(b.startTime),c=b.exerciseType.toLowerCase(),e=new a(d,c),e.totalDuration=Time.fromJson(b.totalDuration),e.totalDistance=Distance.fromJson(b.totalDistance),e},a}()}.call(this),function(){"use strict";var a,b;b={arc:{name:"Archery"},bbl:{name:"Baseball"},bdm:{name:"Badminton"},bkb:{name:"Basketball"},bth:{name:"Biathlon"},bik:{name:"Cycling"},bob:{name:"Bobsled"},box:{name:"Boxing"},cli:{name:"Climbing"},cur:{name:"Curling"},div:{name:"Scuba diving"},fen:{name:"Fencing"},fbl:{name:"Football"},fho:{name:"Field hockey"},glf:{name:"Golf"},gym:{name:"Gymnastics"},hbl:{name:"Handball"},hik:{name:"Hiking"},hoc:{name:"Hockey"},hrd:{name:"Horseback riding"},isk:{name:"Ice-skating"},row:{name:"Rowing"},rsk:{name:"Roller skating"},run:{name:"Running"},sai:{name:"Sailing"},sho:{name:"Shooting"},ski:{name:"Skiing"},sqs:{name:"Squash"},srk:{name:"Snorkeling"},swi:{name:"Swimming"},tbt:{name:"Table tennis"},ten:{name:"Tennis"},tkd:{name:"Taekwondo"},xcs:{name:"Cross-country skiing"},vlb:{name:"Volleyball"},wsr:{name:"Wind surfing"},wtr:{name:"Weight training"},wre:{name:"Wrestling"},yog:{name:"Yoga"}},a=function(){function a(a,c){var d=this;c.$watch("userId",function(b){var e;return null!=b?(d.workoutsRef&&d.workoutsRef.off(),e=new Firebase("https://fitspector.firebaseio.com/users").child(b),d.workoutsRef=e.child("workouts"),a(d.workoutsRef,c,"dbWorkouts")):void 0}),c.$watch("dbWorkouts",function(a){return c.workouts=_(a).map(Workout.fromJson)}),this.workoutType=b}return a.prototype.getSportName=function(a){var c;return c=b[a],c?c.name:void 0},a}(),angular.module("fitspector").service("DataService",["angularFire","$rootScope",a])}.call(this),function(){"use strict";var a;a=function(){function a(a,b){this.angularFire=a,this.$rootScope=b}return a.prototype.getUser=function(){return this.$rootScope.user},a.prototype.setUserId=function(a){var b;return this.$rootScope.userId=a,b=new Firebase("https://fitspector.firebaseio.com/users").child(a),this.angularFire(b,this.$rootScope,"user")},a}(),angular.module("fitspector").service("LoginService",["angularFire","$rootScope",a])}.call(this),function(){"use strict";var a;a=function(){function a(){return{replace:!0,restrict:"E",template:'<span class="glyphicon"></span>',link:function(a,b){var c;return c=function(){switch(b.attr("type")){case"distance":return"road";case"time":return"time";case"elevation":return"chevron-up";case"intensity":return"tint";default:throw new Error("Unknown icon type: "+a.type)}}(),b.addClass("glyphicon-"+c)}}}return a}(),angular.module("fitspector").directive("icon",[a])}.call(this),function(){"use strict";var a;a=function(){function a(){return{replace:!0,restrict:"E",templateUrl:"views/directives/sorting-ctrl.html",scope:{"this":"@",selected:"@"}}}return a}(),angular.module("fitspector").directive("sortingCtrl",[a])}.call(this),function(){"use strict";var a;a=function(){function a(a){return{replace:!0,restrict:"E",templateUrl:"views/directives/sport-icon.html",scope:{sportId:"="},link:function(b){var c;return c=function(){return b.sportName=a.getSportName(b.sportId)},b.$watch("sportId",c)}}}return a}(),angular.module("fitspector").directive("sportIcon",["DataService",a])}.call(this),function(){"use strict";var a;a=function(){function a(){return{replace:!0,restrict:"E",templateUrl:"views/directives/workout-distance.html",scope:{value:"=",noIcon:"@"}}}return a}(),angular.module("fitspector").directive("workoutDistance",[a])}.call(this),function(){"use strict";var a;a=function(){function a(){return{replace:!0,restrict:"E",templateUrl:"views/directives/workout-elevation.html",scope:{value:"=",noIcon:"@"}}}return a}(),angular.module("fitspector").directive("workoutElevation",[a])}.call(this),function(){"use strict";var a;a=function(){function a(){return{replace:!0,restrict:"E",templateUrl:"views/directives/workout-intensity.html",scope:{value:"=",noIcon:"@"}}}return a}(),angular.module("fitspector").directive("workoutIntensity",[a])}.call(this),function(){"use strict";var a;a=function(){function a(){return{replace:!0,restrict:"E",templateUrl:"views/directives/workout-time.html",scope:{value:"=",noIcon:"@"}}}return a}(),angular.module("fitspector").directive("workoutTime",[a])}.call(this),function(){"use strict";var a;a=function(){function a(){return{replace:!0,restrict:"E",templateUrl:"views/directives/workout-distance-gauge.html",scope:{distance:"=",maxGaugeDistance:"="}}}return a}(),angular.module("fitspector").directive("workoutDistanceGauge",[a])}.call(this),function(){"use strict";var a;a=function(){function a(){return{replace:!0,restrict:"E",templateUrl:"views/directives/workout-time-gauge.html",scope:{time:"=",maxGaugeTime:"="}}}return a}(),angular.module("fitspector").directive("workoutTimeGauge",[a])}.call(this),function(){"use strict";var a;a=function(){function a(){var a;return a=d3.time.format("%d %b %Y"),function(b){return a(new Date(b))}}return a}(),angular.module("fitspector").filter("date",[a])}.call(this),function(){"use strict";var a;a=function(){function a(){var a;return a=d3.time.format("%H:%M"),function(b){return a(new Date(b))}}return a}(),angular.module("fitspector").filter("time",[a])}.call(this),function(){"use strict";var a;a=function(){function a(){return function(a){return a.asKilometers().toFixed(1)}}return a}(),angular.module("fitspector").filter("workoutDistance",[a])}.call(this),function(){"use strict";var a;a=function(){function a(){return function(a){return(1e3*a.asKilometers()).toFixed(0)}}return a}(),angular.module("fitspector").filter("workoutElevation",[a])}.call(this),function(){"use strict";var a;a=function(){function a(){return function(a){return a.value().toFixed(0)}}return a}(),angular.module("fitspector").filter("workoutIntensity",[a])}.call(this),function(){"use strict";var a;a=function(){function a(){return function(a){var b,c,d;return b=a.hours(),c=a.minutes(),d=10>c?"0":"",""+b+":"+d+c}}return a}(),angular.module("fitspector").filter("workoutTime",[a])}.call(this),function(){"use strict";var a;a=function(){function a(a,b,c){var d,e,f,g,h,i,j,k;b.playersDB=[],i=new Firebase("https://fitspector.firebaseio.com/users"),c(i,b,"playersDB"),f=function(a){var b;return b={name:a.name,img:a.smallImgUrl,me:a.me,total:Distance.zero,days:_.range(0,7).map(function(){return Distance.zero})}},b.players=[],g=function(a){return b.players=_(a).map(f)},b.$watch("playersDB",g,!0),h=[],e=function(){return h=_.range(0,100).map(function(){return Math.random()})},b.competitionMode="distance",b.setCompetitionMode=function(a){return b.competitionMode=a},b.$watch("competitionMode",function(a){return b.leaderboardModeTitle=function(){switch(a){case"distance":return"total workout distance";case"time":return"total workout time";case"elevation":return"total elevation gain";case"intensity":return"workout intensity"}}()}),d=function(){var a,c,d,e,f,g;return 0===b.players.length?[]:(a=function(){switch(b.timeMode){case"week":return 7;case"month":return 30;case"year":return 365}}(),f=_(h).map(function(b){return b*a}),g=function(){switch(b.competitionMode){case"distance":return function(a){return new Distance(1e4*a)};case"time":return function(a){return new Time(1*60*60*a)};case"elevation":return function(a){return new Distance(300*a)};case"intensity":return function(a){return new Intensity(40*a)};default:throw new Error("Unknown competition mode: "+b.competitionMode)}}(),e=function(a){return _.extend({score:g(f.pop())},a)},d=_.chain(b.players).map(e).sortBy(function(a){return-a.score.value()}).value(),c=d[0].score,d=_(d).map(function(a){return _.extend(a,{scoreToLeader:c.subtract(a.score)})}),b.leaderboard=d)},b.$watch("players",d,!0),b.$watch("competitionMode",function(){return e(),d()}),j=function(){switch(b.timeMode){case"year":return"years";case"month":return"months";case"week":return"weeks"}},b.setTimeMode=function(a){return b.timeMode=a},b.goNow=function(){return b.timeStart=moment()},b.next=function(){return b.timeStart.add(j(),1)},b.prev=function(){return b.timeStart.add(j(),-1)},b.setTimeMode("week"),b.goNow(),k=function(){var a,c,d;return b.timeStart.startOf(b.timeMode),b.modeDesc=function(){switch(b.timeMode){case"year":return b.timeStart.format("YYYY");case"month":return b.timeStart.format("MMM YYYY");case"week":return b.timeStart.format("W / gggg")}}(),b.modeFullDesc=function(){switch(b.timeMode){case"week":return a=b.timeStart.clone().add("days",6),d=b.timeStart.format("LL"),c=a.format("LL"),"("+d+" — "+c+")";default:return""}}(),b.leaderboardTimeTitle=function(){switch(b.timeMode){case"year":return""+b.timeStart.format("YYYY");case"month":return b.timeStart.format("MMMM YYYY");case"week":return"week "+b.timeStart.format("W / gggg")}}(),b.modeFullDesc="week"===b.timeMode?(a=b.timeStart.clone().add("days",6),""+b.timeStart.format("LL")+" — "+a.format("LL")):""},b.$watch("timeStart.valueOf()",function(){return k(),e(),d()}),b.$watch("timeMode",function(){return k(),e(),d()})}return a}(),angular.module("fitspector").controller("LeaderboardCtrl",["$http","$scope","angularFire",a])}.call(this),function(){"use strict";var a;a=function(){function a(a,b,c,d,e){var f,g,h;f=d.code,h=function(a){return e.setUserId(a.userId),b.url("/")},g=function(){},c.get("/api/login_rk/"+f).success(h).error(g)}return a}(),angular.module("fitspector").controller("LoginRunKeeperCtrl",["$scope","$location","$http","$routeParams","LoginService",a])}.call(this),function(){"use strict";var a;a=function(){function a(b,c,d){c.isAt=function(c){return b.path()===a.urls[c]},c.goTo=function(c){return b.path(a.urls[c])},c.isLoggedIn=function(){var a;return a=d.getUser(),void 0!==a&&null!==a},c.getUser=function(){return d.getUser()}}return a.urls={workouts:"/workouts",leaderboard:"/leaderboard"},a}(),angular.module("fitspector").controller("NavigationCtrl",["$location","$scope","LoginService",a])}.call(this),function(){"use strict";var a;a=function(){function a(a,b){var c,d,e;b.maxGaugeTime=new Time(7200),b.maxGaugeDistance=new Distance(2e4),e=function(){var a;switch(b.mode){case"year":b.modeDesc=b.timeStart.format("YYYY");break;case"month":b.modeDesc=b.timeStart.format("MMM YYYY");break;case"week":b.modeDesc=b.timeStart.format("W / gggg")}return b.modeFullDesc="week"===b.mode?(a=b.timeEnd().subtract("days",1),""+b.timeStart.format("LL")+" — "+a.format("LL")):""},c=function(a){switch(b.mode){case"year":return a.startOf("year");case"month":return a.startOf("month");case"week":return a.startOf("week")}},d=function(a,d){switch(b.mode){case"year":d.add("years",a);break;case"month":d.add("months",a);break;case"week":d.add("weeks",a)}return c(d)},b.setMode=function(a){return b.mode=a,c(b.timeStart),e()},b.next=function(){return d(1,b.timeStart),e()},b.prev=function(){return d(-1,b.timeStart),e()},b.goNow=function(){return b.timeStart=moment(),d(0,b.timeStart),e()},b.timeEnd=function(){return d(1,b.timeStart.clone())},b.goNow(),b.setMode("year"),b.getWorkouts=function(){var c,d,e;return c=b.timeStart,d=b.timeEnd(),e=function(a){return a.startTime.isBefore(d)&&(a.startTime.isAfter(c)||a.startTime.isSame(c))},_(a.getAllWorkouts()).filter(e)},b.order="-startTime",b.orderBy=function(a){var c;return c="-"+a,b.order=b.order===c?a:c}}return a}(),angular.module("fitspector").controller("WorkoutsCtrl",["DataService","$scope",a])}.call(this),function(){$("body").tooltip({selector:"[rel=tooltip]"})}.call(this),function(){"use strict";var a;a=function(){function a(a,b){a.html5Mode(!0),b.when("/login_rk",{templateUrl:"views/login_rk",controller:"LoginRunKeeperCtrl"}).when("/workouts",{templateUrl:"views/workouts.html",controller:"WorkoutsCtrl"}).when("/leaderboard",{templateUrl:"views/leaderboard.html",controller:"LeaderboardCtrl"}).when("/",{templateUrl:"views/main.html"}).otherwise({redirectTo:"/"})}return a}(),angular.module("fitspector").config(["$locationProvider","$routeProvider",a])}.call(this),angular.module("fitspector").run(["$templateCache",function(a){a.put("views/directives/sorting-ctrl.html",'<span class="sorting-ctrls"><span ng-show="selected == this" class="glyphicon glyphicon-sort-by-attributes"></span> <span ng-show="selected == \'-\' + this" class="glyphicon glyphicon-sort-by-attributes-alt"></span> <span ng-hide="selected == this || selected == \'-\' + this" class="glyphicon glyphicon-sort-by-attributes-alt invisible"></span></span>'),a.put("views/directives/sport-icon.html",'<div class="sport-icon-container for-{{sportId}}" rel="tooltip" data-toggle="tooltip" data-title="{{sportId}}" data-original-title="{{sportName}}"><div class="sport-icon sport-{{sportId}}"></div></div>'),a.put("views/directives/workout-distance-gauge.html",'<div class="progress pace" ng-hide="distance.getTotal().isZero()" ng-style="{width: distance.gaugePercent(maxGaugeDistance)}"><div ng-repeat="i in [0, 1, 2, 3, 4, 5, 6]" ng-style="{width: distance.zonePercent(i)}" class="progress-bar progress-bar-z{{i}}"></div></div>'),a.put("views/directives/workout-distance.html",'<span class="workout-distance" ng-hide="distance.isZero()"><icon ng-hide="noIcon" type="distance"></icon><span ng-bind="value | workoutDistance"></span> <span class="unit">km</span></span>'),a.put("views/directives/workout-elevation.html",'<span class="workout-elevation" ng-hide="elevation.isZero()"><icon ng-hide="noIcon" type="elevation"></icon><span ng-bind="value | workoutElevation"></span> <span class="unit">m</span></span>'),a.put("views/directives/workout-intensity.html",'<span class="workout-intensity" ng-hide="intensity.isZero()"><icon ng-hide="noIcon" type="intensity"></icon><span ng-bind="value | workoutIntensity"></span> <span class="unit">pts</span></span>'),a.put("views/directives/workout-time-gauge.html",'<div class="progress hr" ng-style="{width: time.gaugePercent(maxGaugeTime)}"><div ng-repeat="i in [0, 1, 2, 3, 4, 5, 6]" ng-style="{width: time.zonePercent(i)}" class="progress-bar progress-bar-z{{i}}"></div></div>'),a.put("views/directives/workout-time.html",'<span class="workout-time"><icon ng-hide="noIcon" type="time"></icon><span ng-bind="value | workoutTime"></span></span>'),a.put("views/leaderboard.html",'<div id="leaderboard" ng-controller="LeaderboardCtrl"><div class="panel panel-default"><div class="panel-heading"><h3 class="panel-title">Leaderboard</h3></div><div class="panel-body"><form><div class="form-group"><label>Compare based on:</label><div class="btn-group"><button class="btn btn-primary" ng-class="{active: competitionMode == \'distance\'}" ng-click="setCompetitionMode(\'distance\')"><icon type="distance"></icon>Distance</button> <button class="btn btn-primary" ng-class="{active: competitionMode == \'time\'}" ng-click="setCompetitionMode(\'time\')"><icon type="time"></icon>Time</button> <button class="btn btn-primary" ng-class="{active: competitionMode == \'elevation\'}" ng-click="setCompetitionMode(\'elevation\')"><icon type="elevation"></icon>Elevation gain</button> <button class="btn btn-primary" ng-class="{active: competitionMode == \'intensity\'}" ng-click="setCompetitionMode(\'intensity\')"><icon type="intensity"></icon>Workout intensity</button></div></div><div class="form-group"><label>Time range:</label><div class="btn-group"><button class="btn btn-primary" ng-class="{active: timeMode == \'week\'}" ng-click="setTimeMode(\'week\')">Week</button> <button class="btn btn-primary" ng-class="{active: timeMode == \'month\'}" ng-click="setTimeMode(\'month\')">Month</button> <button class="btn btn-primary" ng-class="{active: timeMode == \'year\'}" ng-click="setTimeMode(\'year\')">Year</button></div><div class="btn-group"><button type="button" class="btn btn-primary" ng-click="prev()"><span class="glyphicon glyphicon-chevron-left"></span></button> <button type="button" class="btn btn-primary selected-time" ng-click="goNow()" ng-bind="modeDesc"></button> <button type="button" class="btn btn-primary" ng-click="next()"><span class="glyphicon glyphicon-chevron-right"></span></button></div><small ng-bind="modeFullDesc"></small></div></form></div><h3 class="text-center">Leaderboard for {{leaderboardTimeTitle}}<br><small>Based on {{leaderboardModeTitle}}</small></h3><table class="table table-hover leaderboard"><tr><th class="position">#</th><th class="player">Player</th><th class="segment" ng-repeat="segment in getSegments()" ng-bind="segment.name"></th><th class="score">Score<div class="behindLeader">(behind the leader)</div></th></tr><tr ng-repeat="player in leaderboard" ng-class="{success: player.me}"><td class="position"><span ng-bind="$index+1"></span></td><td class="player"><img class="img-thumbnail thumb" ng-src="{{player.img}}"> {{player.name}}</td><td class="score"><div ng-switch="competitionMode"><div ng-switch-when="distance"><workout-distance value="player.score"></workout-distance><div class="behindLeader" ng-hide="$index == 0">(<workout-distance no-icon="true" value="player.scoreToLeader"></workout-distance>)</div></div><div ng-switch-when="time"><workout-time value="player.score"></workout-time><div class="behindLeader" ng-hide="$index == 0">(<workout-time no-icon="true" value="player.scoreToLeader"></workout-time>)</div></div><div ng-switch-when="elevation"><workout-elevation value="player.score"></workout-elevation><div class="behindLeader" ng-hide="$index == 0">(<workout-elevation no-icon="true" value="player.scoreToLeader"></workout-elevation>)</div></div><div ng-switch-when="intensity"><workout-intensity value="player.score"></workout-intensity><div class="behindLeader" ng-hide="$index == 0">(<workout-intensity no-icon="true" value="player.scoreToLeader"></workout-intensity>)</div></div></div></td></tr></table></div></div>'),a.put("views/login_rk.html",'<div class="alert alert-info"><span class="glyphicon glyphicon-info-sign"></span> Sit tight, we\'re logging you in via RunKeeper...</div>'),a.put("views/main.html","<div>Nothing here yet...</div>"),a.put("views/topbar.html",'<div class="navbar navbar-inverse navbar-fixed-top" role="navigation" ng-controller="NavigationCtrl"><div class="container"><a class="logo" href="/"><img src="/images/logo.png"></a><div class="navbar-header"><button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse"><span class="icon-bar"></span> <span class="icon-bar"></span> <span class="icon-bar"></span></button></div><div class="navbar-collapse collapse"><ul class="nav navbar-nav"><li ng-class="{active: isAt(\'workouts\')}"><a href="/workouts"><span class="glyphicon glyphicon-list-alt"></span> Workout log</a></li><li ng-class="{active: isAt(\'leaderboard\')}"><a href="/leaderboard"><span class="glyphicon glyphicon-stats"></span> Leaderboard</a></li></ul><ul class="nav navbar-nav navbar-right"><li ng-if="isLoggedIn()" class="disabled"><a href="#"><span class="user-name" ng-bind="getUser().name"></span></a></li><li ng-if="isLoggedIn()"><a href="#" class="dropdown-toggle user-toggle" data-toggle="dropdown"><img class="img-rounded" ng-src="{{getUser().smallImgUrl}}"> <b class="caret"></b></a><ul class="dropdown-menu"><li><a href="#"><span class="glyphicon glyphicon-off"></span> Logout</a></li></ul></li><li ng-hide="isLoggedIn()" class="dropdown"><a href="#" class="dropdown-toggle" data-toggle="dropdown">Login <b class="caret"></b></a><ul class="dropdown-menu"><li><a href="https://runkeeper.com/apps/authorize?client_id=b459a206aced43729fc79026df108e60&redirect_uri=https%3A%2F%2Fwww.fitspector.com%2Flogin_rk&response_type=code&state="><img src="http://static1.runkeeper.com/images/assets/login-blue-black-200x38.png"></a></li></ul></li></ul></div></div></div>'),a.put("views/workouts.html",'<div class="workouts" ng-controller="WorkoutsCtrl"><div class="panel panel-default"><div class="panel-heading"><h3 class="panel-title">Your workouts</h3></div><div class="panel-body"><div class="btn-toolbar"><div class="btn-group"><button class="btn btn-primary active"><span class="glyphicon glyphicon-list"></span> List</button> <button class="btn btn-primary"><span class="glyphicon glyphicon-calendar"></span> Calendar</button></div><div class="btn-group"><button class="btn btn-primary" ng-class="{active: mode == \'year\'}" ng-click="setMode(\'year\')">Year</button> <button class="btn btn-primary" ng-class="{active: mode == \'month\'}" ng-click="setMode(\'month\')">Month</button> <button class="btn btn-primary" ng-class="{active: mode == \'week\'}" ng-click="setMode(\'week\')">Week</button></div></div></div><div class="text-center"><div class="btn-group"><button type="button" class="btn btn-primary" ng-click="prev()"><span class="glyphicon glyphicon-chevron-left"></span></button> <button type="button" class="btn btn-primary" ng-click="goNow()" ng-bind="modeDesc"></button> <button type="button" class="btn btn-primary" ng-click="next()"><span class="glyphicon glyphicon-chevron-right"></span></button></div><div><small ng-bind="modeFullDesc"></small></div></div><table class="table workouts-list"><tr><th class="date"><span class="sortHandler" ng-click="orderBy(\'startTime\')">Date</span><sorting-ctrl this="startTime" selected></sorting-ctrl></th><th class="sport"><span class="sortHandler" ng-click="orderBy(\'exerciseType\')">Sport</span><sorting-ctrl this="exerciseType" selected></sorting-ctrl></th><th class="note">Notes</th><th class="time-label">Time</th><th class="distance-label">Distance</th><th class="details"></th></tr><tr ng-repeat="workout in workouts | orderBy: order" class="sport-{{workout.exerciseType}}"><td class="date"><div ng-bind="workout.startTime | date"></div><div ng-bind="workout.startTime | time"></div></td><td class="sport"><sport-icon sport-id="workout.exerciseType"></sport-icon></td><td class="note"><span ng-bind="workout.note"></span></td><td class="time-label"><workout-time time="workout.totalDuration"></workout-time></td><td class="distance-label"><workout-distance distance="workout.totalDistance"></workout-distance></td><td class="details"><a class="btn btn-primary btn-sm" href="/"><span class="glyphicon glyphicon-zoom-in"></span> details</a></td></tr></table></div></div>')}]);