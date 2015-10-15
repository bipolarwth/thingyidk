'use strict';

/**
 * Das Modul fuer den Mensa-Zugriff.
 */
var canteen = angular.module('Canteen', []);

/**
 * Kapselung des Zugriffs in Form eines Dienstes.
 * Noch einfacher klappt der Zugriff auf eine REST-Schnittstelle
 * in vielen Faellen mit dem Modul ngResource.
 */
canteen.factory('CanteenService', [ '$http', function($http) {
    var server = {};

    /**
     * Abholen der Essen.
     * @param date Datum des Essens.
     * @returns Alle Essen, sortiert in Gruppen von Mahlzeiten.
     */
    server.getMeals = function(url, date) {
        return $http.get(url + server.formatDate(date));
    };

    /**
     * Hilfsfunktion, um das Datum fuer die Anfrage aufzubereiten.
     * @param date Zu formatierendes Datum.
     * @returns {string} Datum als String im Format "yyyy-MM-dd".
     */
    server.formatDate = function(date) {
        return(date.toISOString().split('T'))[ 0 ];
    };

    /**
     * Die eigentliche Funktion des Dienstes.
     * @param date Datum des Essens.
     * @returns Alle Essen, sortiert in Gruppen von Mahlzeiten.
     */
    return {
        getMeals: function(url, date) {
            return server.getMeals(url, date);
        }
    }
}]);

/**
 * Controller fuer Ausgabe der Mahlzeiten.
 */
canteen.controller('CanteenController', ['$scope', 'CanteenService', function($scope, CanteenService) {
    // Vorinitialisiert mit aktuellem Datum, Zeit wird auf 00:00:00 gesetzt.
    var today = new Date();
    $scope.canteenDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    /**
     * Essen mit eingestelltem Datum erneut abholen.
     */
    $scope.refresh = function() {
        CanteenService.getMeals($scope.url, $scope.canteenDate).then(function(response) {
            $scope.meals = response.data;
        }, function(error) {
            console.log('No meals:' + error);
        });
    };

    /**
     * Datum um einen tag erhoehen, Essen erneut abholen.
     */
    $scope.incrementDate = function() {
        $scope.canteenDate = new Date($scope.canteenDate.getFullYear(), $scope.canteenDate.getMonth(), $scope.canteenDate.getDate() + 1);
        $scope.refresh();
    };

    /**
     * Empfang von Nachrichten eines Vater-Controllers.
     */
    $scope.$on('refreshCanteen', function(event) {$scope.refresh();});
    $scope.$on('incrementDate', function(event) {$scope.incrementDate();});

    /**
     * Initial: Essen abholen.
     */
    $scope.refresh();
}]);

canteen.directive('canteenView', function() {
    return {
        scope: {
            url: '@url'
        },
        templateUrl: 'canteen/canteenTemplate.html',
        restrict: 'E',
        link: function(scope, element, attrs) {
        }
    };
});
