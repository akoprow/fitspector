(function() {
  'use strict';
  var AnalyzeCtrl;

  AnalyzeCtrl = (function() {
    function AnalyzeCtrl(WorkoutsProviderService, $scope) {
      $scope.valueModes = [
        {
          id: 'duration',
          desc: 'Duration'
        }, {
          id: 'distance',
          desc: 'Distance'
        }, {
          id: 'elevation',
          desc: 'Elevation'
        }
      ];
      $scope.valueMode = $scope.valueModes[1];
      $scope.setValueMode = function(mode) {
        return $scope.valueMode = mode;
      };
    }

    return AnalyzeCtrl;

  })();

  angular.module('fitspector').controller('AnalyzeCtrl', ['WorkoutsProviderService', '$scope', AnalyzeCtrl]);

}).call(this);
