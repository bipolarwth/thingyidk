'use strict';

// Declare app level module which depends on views, and components
var mainApp = angular.module('MainApp', ['Praxisboerse', 'Canteen', 'ui.bootstrap', 'base64']);

mainApp.config(function($httpProvider) {
// Cross-Domain-Aufrufe erlauben
  $httpProvider.defaults.useXDomain = true;
// Das Mitsenden von Authentifizierungsinformationen erlauben
  $httpProvider.defaults.withCredentials = true;
});

mainApp.controller('MainController', ['$base64', '$scope', 'PraxisboerseService', function($base64, $scope, PraxisboerseService) {

  //$scope.scopeTest = "scopeTest";

  $scope.user = [];
  $scope.user.name = "username here";
  $scope.user.password = "password here";

  $scope.login = function() {
    console.log("login with " + $scope.user.name + " and " + $scope.user.password);

    // Check credentials
    //var hskaCredentialCheckUrl = "http://www.iwi.hs-karlsruhe.de/Intranetaccess/REST/credential/check/";
    //var urlToCheck = hskaCredentialCheckUrl + $scope.user.name + "/" + $scope.user.password;

    PraxisboerseService.checkCredentials($scope.user.name, $scope.user.password);
    //$scope.$broadcast('refreshPraxisboerse');
  };

  $scope.refresh = function() {
    //$scope.$broadcast('incrementDate');
    $scope.$broadcast('refreshPraxisboerse');
  };

}]);