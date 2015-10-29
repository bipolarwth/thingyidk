'use strict';

/**
 * Das Modul fuer den Zugriff auf die Praxisboerse.
 */
var praxisboerse = angular.module('Praxisboerse', ['base64']);

/**
 * Kapselung des Zugriffs in Form eines Dienstes.
 * Noch einfacher klappt der Zugriff auf eine REST-Schnittstelle
 * in vielen Faellen mit dem Modul ngResource.
 */
praxisboerse.factory('PraxisboerseService', [ '$http', '$base64', '$rootScope', function($http, $base64, $rootScope) {
    var server = {};

    /**
     * Abholen der Essen.
     * @returns Alle Essen, sortiert in Gruppen von Mahlzeiten.
     */
    server.getData = function(url) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.userCredentials
        return $http.get(url);
    };

    /**
     * Die eigentliche Funktion des Dienstes.
     * @returns Alle Essen, sortiert in Gruppen von Mahlzeiten.
     */
    return {
        getData: function(url) {
            return server.getData(url);
        }
    }
}]);

/**
 * Controller fuer Ausgabe der Mahlzeiten.
 */
praxisboerse.controller('PraxisboerseController', ['$scope', '$rootScope', 'PraxisboerseService', function($scope, $rootScope, PraxisboerseService) {


    /**
     * Essen mit eingestelltem Datum erneut abholen.
     */
    PraxisboerseService.checkCredentials = function() {
        //var hskaCredentialCheckUrl = "http://www.iwi.hs-karlsruhe.de/Intranetaccess/REST/credential/check/"
        //var urlToCheck = hskaCredentialCheckUrl + username + "/" + password;
        $scope.mobileDevice = $rootScope.mobileDevice;

        PraxisboerseService.getData($scope.url).then(function(response) {
            console.log("response: " + response.data);
            $scope.offerTypes = response.data;
            $rootScope.loggedIn = true;
        }, function(error) {
            console.log('No credent:' + error);
            $scope.offerTypes = '' + error;
        });
    };

    PraxisboerseService.getOffers = function(url) {
        //var hskaCredentialCheckUrl = "http://www.iwi.hs-karlsruhe.de/Intranetaccess/REST/credential/check/"
        //var urlToCheck = hskaCredentialCheckUrl + username + "/" + password;

        PraxisboerseService.getData(url).then(function(response) {
            console.log("response: " + response.data);
            $scope.offers = response.data;
        }, function(error) {
            console.log('No credent:' + error);
            $scope.offers = '' + error;
        });
    };

    ///**
    // * Empfang von Nachrichten eines Vater-Controllers.
    // */
    $scope.$on('refreshPraxisboerse', function(event) {
        $scope.checkCredentials();
    });

    $scope.updateSelectedOfferType = function() {
        console.log($scope.selectedOfferType);
        PraxisboerseService.getOffers($rootScope.restURL + "joboffer/offers/" + $scope.selectedOfferType + "/0/-1");
    };

    /**
     * Initial: Essen abholen.
     */
    //$scope.refresh();
}]);

praxisboerse.directive('praxisboerseView', function() {
    return {
        scope: {
            url: '@url'
        },
        templateUrl: 'praxisboerse/praxisboerseTemplate.html',
        restrict: 'E',
        link: function(scope, element, attrs) {
        }
    };
});
