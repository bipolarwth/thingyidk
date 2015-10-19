'use strict';

// Declare app level module which depends on views, and components
var mainApp = angular.module('MainApp', ['Praxisboerse', 'ui.bootstrap']);

mainApp.controller('MainController', ['$scope', 'PraxisboerseService', function($scope, PraxisboerseService) {

  //$scope.scopeTest = "scopeTest";

  $scope.user = [];
  $scope.user.name = "username here";
  $scope.user.password = "password here";

  $scope.login = function() {
    console.log("login with " + $scope.user.name + " and " + $scope.user.password);

    // Check credentials
    var hskaCredentialCheckUrl = "http://www.iwi.hs-karlsruhe.de/Intranetaccess/REST/credential/check/";
    var urlToCheck = hskaCredentialCheckUrl + $scope.user.name + "/" + $scope.user.password;

    PraxisboerseService.checkCredentials($scope.user.name, $scope.user.password);
  };

  $scope.refresh = function() {
    //$scope.$broadcast('incrementDate');
    $scope.$broadcast('refreshPraxisboerse');
  };

}]);