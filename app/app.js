'use strict';

// Declare app level module which depends on views, and components
var mainApp = angular.module('MainApp', ['Praxisboerse', 'ui.bootstrap']);

mainApp.controller('MainController', ['$scope', function($scope) {

  //$scope.scopeTest = "scopeTest";

  $scope.user = [];
  $scope.user.name = "username here";
  $scope.user.password = "password here";

  $scope.login = function() {
    console.log("login with " + $scope.user.name + " and " + $scope.user.password);
  };

  $scope.refresh = function() {
    //$scope.$broadcast('incrementDate');
    $scope.$broadcast('refreshPraxisboerse');
  };

}]);