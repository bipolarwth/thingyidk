'use strict';

// Declare app level module which depends on views, and components
var myApp = angular.module('myApp', []);

myApp.controller('MainController', ['$scope', function($scope) {

  //$scope.scopeTest = "scopeTest";

  $scope.user = [];
  $scope.user.name = "username here";
  $scope.user.password = "password here";

  $scope.login = function() {
    console.log("login with " + $scope.user.name + " and " + $scope.user.password);
  };

}]);