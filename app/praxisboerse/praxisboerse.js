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
praxisboerse.factory('PraxisboerseService', [ '$http', '$base64', function($http, $base64) {
    var server = {};

    /**
     * Abholen der Essen.
     * @returns Alle Essen, sortiert in Gruppen von Mahlzeiten.
     */
    server.getCredent = function(url, username, password) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $base64.encode(username + ':' + password)
        return $http.get(url);
    };

    /**
     * Die eigentliche Funktion des Dienstes.
     * @returns Alle Essen, sortiert in Gruppen von Mahlzeiten.
     */
    return {
        getCredent: function(url, username, password) {
            return server.getCredent(url, username, password);
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
    PraxisboerseService.checkCredentials = function(username, password) {
        //var hskaCredentialCheckUrl = "http://www.iwi.hs-karlsruhe.de/Intranetaccess/REST/credential/check/"
        //var urlToCheck = hskaCredentialCheckUrl + username + "/" + password;

        PraxisboerseService.getCredent($scope.url, username, password).then(function(response) {
            console.log("response: " + response.data);
            $scope.offers = response.data;
            $rootScope.loggedIn = true;
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
