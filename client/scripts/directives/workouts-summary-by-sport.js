(function() {
  'use strict';
  var ELEMENT_WIDTH, WorkoutSportsSummaryAnimation, WorkoutsSummaryBySportDirective, recompute;

  ELEMENT_WIDTH = 60;

  WorkoutsSummaryBySportDirective = (function() {
    function WorkoutsSummaryBySportDirective() {
      return {
        replace: true,
        restrict: 'E',
        templateUrl: 'views/directives/workouts-summary-by-sport.html',
        scope: {
          workouts: '=',
          queryFilter: '=',
          sportFilterListener: '&'
        },
        link: function(scope, elt) {
          scope.elementWidth = ELEMENT_WIDTH;
          scope.$watchCollection('workouts', function() {
            return recompute(scope);
          });
          scope.$watch('queryFilter', function() {
            return recompute(scope);
          });
          scope.sportFilter = 'all';
          scope.setSportFilter = function(sport) {
            scope.sportFilter = scope.sportFilter === sport.id ? 'all' : sport.id;
            return scope.sportFilterListener({
              sport: scope.sportFilter
            });
          };
          scope.$watch('sportFilter', function() {
            return recompute(scope);
          });
          scope.activeColumn = -1;
          scope.setActiveColumn = function(index) {
            return scope.activeColumn = index;
          };
          return recompute(scope);
        }
      };
    }

    return WorkoutsSummaryBySportDirective;

  })();

  recompute = function(scope) {
    var sportFilter, workouts;
    if (scope.workouts == null) {
      return;
    }
    sportFilter = scope.sportFilter;
    workouts = scope.$eval('workouts | filter: queryFilter');
    return scope.sports = _.chain(workouts).filter(function(workout) {
      return sportFilter === 'all' || workout.exerciseType === sportFilter;
    }).groupBy(function(workout) {
      return workout.exerciseType.id;
    }).map(function(workouts) {
      return {
        exerciseType: workouts[0].exerciseType,
        sessions: workouts.length,
        totalDistance: new Distance({
          meters: d3.sum(workouts, function(workout) {
            return workout.totalDistance.asMeters();
          })
        }),
        totalDuration: new Time({
          seconds: d3.sum(workouts, function(workout) {
            return workout.totalDuration.asSeconds();
          })
        }),
        totalElevation: new Distance({
          meters: d3.sum(workouts, function(workout) {
            return workout.totalElevation.asMeters();
          })
        })
      };
    }).values().value();
  };

  angular.module('fitspector').directive('workoutsSummaryBySport', [WorkoutsSummaryBySportDirective]);

  WorkoutSportsSummaryAnimation = (function() {
    var getPosition;

    getPosition = function(element) {
      var index;
      index = element.scope().$index;
      return {
        left: index * ELEMENT_WIDTH
      };
    };

    function WorkoutSportsSummaryAnimation() {
      return {
        enter: function(element, done) {
          jQuery(element).attr(getPosition(element));
          return done();
        },
        move: function(element, done) {
          return jQuery(element).animate(getPosition(element, done));
        }
      };
    }

    return WorkoutSportsSummaryAnimation;

  })();

}).call(this);
