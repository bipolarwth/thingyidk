'use strict';

/**
 * Das Modul fuer den Zugriff auf die Praxisboerse.
 */
var praxisboerse = angular.module('Praxisboerse', ['base64', 'ngAnimate', 'ui.bootstrap']);

/**
 * Kapselung des Zugriffs in Form eines Dienstes.
 * Noch einfacher klappt der Zugriff auf eine REST-Schnittstelle
 * in vielen Faellen mit dem Modul ngResource.
 */
praxisboerse.factory('PraxisboerseService', [ '$http', '$base64', '$rootScope', function($http, $base64, $rootScope) {
    var server = {};

    /**
     * Aufruf an den Server mit Base64 encodierten Zugangsdaten (userCredentials)
     * @returns den REST Respone Body
     */
    server.getData = function(url) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.userCredentials;
        return $http.get(url);
    };

    /**
     * Aufruf an den Server mit Base64 encodierten Zugangsdaten (userCredentials)
     * @returns den REST Respone Body
     */
    server.postData = function(url, offerId) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.userCredentials;
        return $http.post(url, offerId);
    };

    /**
     * Aufruf an den Server mit Base64 encodierten Zugangsdaten (userCredentials)
     * @returns den REST Respone Body
     */
    server.deleteData = function(url) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.userCredentials;
        return $http.delete(url);
    };

    /**
     * Die eigentliche Funktion des Dienstes.
     * @returns den Server Response
     */
    return {
        getData: function(url) {
            return server.getData(url);
        },
        postData: function(url, offerId) {
            return server.postData(url, offerId);
        },
        deleteData: function(url) {
            return server.deleteData(url);
        }
    }
}]);

/**
 * Controller fuer die Verwaltung von Angebotstypen und Angeboten.
 */
praxisboerse.controller('PraxisboerseController',
    ['$scope', '$rootScope', 'PraxisboerseService', '$uibModal', function($scope, $rootScope, PraxisboerseService, $uibModal, $log) {

    $scope.offerResultsStart = 0;
    $scope.offerResultsCount = 10;
    $scope.textfilter = "";
    $scope.checkboxModel = {
        checked : true
    };

    var selected = $scope.selected = [];

    var updateSelected = function(action, id) {
        if (action === 'add' && $scope.selected.indexOf(id) === -1) {
            $scope.selected.push(id);
            PraxisboerseService.putOfferOnNotepad(id);
        }
        if (action === 'remove' && $scope.selected.indexOf(id) !== -1) {
            $scope.selected.splice($scope.selected.indexOf(id), 1);
            PraxisboerseService.deleteOfferFromNotepad(id);
        }
    };

    $scope.updateSelection = function($event, id) {
        var checkbox = $event.target;
        var action = (checkbox.checked ? 'add' : 'remove');
        console.log("selectedOfferId: " + id);
        updateSelected(action, id);
    };

    $scope.isSelected = function(id) {
        return $scope.selected.indexOf(id) >= 0;
    };

    /**
     * Angebote auf den Merkzettel speichern
     * @param url
     */
    PraxisboerseService.putOfferOnNotepad = function(offerId) {
        var url = $rootScope.restURL + "joboffer/notepad/offer";
        console.log("PostUrl: " + url);
        console.log("OfferId to put on notepad: " + offerId);

        PraxisboerseService.postData(url, offerId).then(function(response) {
            console.log("ServerResponse: " + response);
        }, function(error) {
            console.log('error: ' + error);
        });
    };

    /**
     * Angebote vom Merkzettel löschen
     * @param url
     */
    PraxisboerseService.deleteOfferFromNotepad = function(offerId) {
        var url = $rootScope.restURL + "joboffer/notepad/offer/" + offerId;
        console.log("DeleteUrl: " + url);

        PraxisboerseService.deleteData(url).then(function(response) {
            console.log("ServerResponse: " + response);
        }, function(error) {
            console.log('error: ' + error);
        });
    };

    /**
     * Initial die Angebotstypen vom Server abholen
     */
    PraxisboerseService.getOfferTypes = function() {
        //var hskaCredentialCheckUrl = "http://www.iwi.hs-karlsruhe.de/Intranetaccess/REST/credential/check/"
        //var urlToCheck = hskaCredentialCheckUrl + username + "/" + password;
        $scope.mobileDevice = $rootScope.mobileDevice;

        PraxisboerseService.getData($scope.url).then(function(response) {
            //console.log("response: " + response.data);
            $scope.selectedOfferType = "preselect";
            $scope.offerTypes = response.data;
            $rootScope.loggedIn = true;
        }, function(error) {
            console.log('error: ' + error);
            $scope.offerTypes = '' + error;
        });

        $scope.updateResults();
    };

    /**
     * Die Angebote vom Server mit der angegebenen URL per REST abholen
     * @param url
     */
    PraxisboerseService.getOffers = function(url) {
        //var hskaCredentialCheckUrl = "http://www.iwi.hs-karlsruhe.de/Intranetaccess/REST/credential/check/"
        //var urlToCheck = hskaCredentialCheckUrl + username + "/" + password;

        console.log("Request: " + url);

        PraxisboerseService.getData(url).then(function(response) {
            console.log("totalHits: " + response.data.totalHits);
            $scope.offers = response.data;

            if(url.indexOf("notepad") > -1)
            {
                angular.forEach($scope.offers.offers, function(value) {
                    this.push(value.id);
                }, selected);
            }

        }, function(error) {
            console.log('error: ' + error);
            $scope.offers = '' + error;
        });
    };

    $scope.openPopUp = function(selectedOffer) {

        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'popupTemplate.html',
            controller: 'PopupInstanceController',
            size: 'lg',
            resolve: {
                // Argumente an den Controller sind ggf. unnoetig
                selectedOffer: function () {
                    return selectedOffer;
                }
            }
        });
    };

    /**
     * Wendet den in die Textbox eingegebenen Text als Filter auf die Ergebnisse an.
     */
    $scope.applyTextfilter = function(userFilterText) {
        $scope.textfilter = userFilterText;
        //console.log("textfilter: " + $scope.textfilter);
        if($scope.textfilter != "")
            $scope.textfilter += "/";

        $scope.updateSelectedOfferType();
    };

    /**
     * Datum um einen tag erhoehen, Essen erneut abholen.
     */
    $scope.incrementOfferResultsStart = function() {
        $scope.offerResultsStart = $scope.offerResultsStart + $scope.offerResultsCount +1 ;
        //PraxisboerseService.getOffers($rootScope.restURL + "joboffer/offers/" + $scope.selectedOfferType + "/" + $scope.offerResultsStart + "/" + $scope.offerResultsCount);
        $scope.updateResults();

    };

    /**
     * Datum um einen tag erhoehen, Essen erneut abholen.
     */
    $scope.decrementOfferResultsStart = function() {
        $scope.offerResultsStart = $scope.offerResultsStart - $scope.offerResultsCount -1 ;
        //PraxisboerseService.getOffers($rootScope.restURL + "joboffer/offers/" + $scope.selectedOfferType + "/" + $scope.offerResultsStart + "/" + $scope.offerResultsCount);
        $scope.updateResults();
    };

    /**
     * Empfang von Nachrichten eines Vater-Controllers.
     */
    //$scope.$on('incrementOfferResultsStart', function(event) {$scope.incrementOfferResultsStart();});
    //$scope.$on('decrementOfferResultsStart', function(event) {$scope.decrementOfferResultsStart();});

    ///**
    // * Aktualisierung der Daten
    // */
    //$scope.$on('refreshPraxisboerse', function(event) {
    //    $scope.getOffers();
    //});

    $scope.updateSelectedOfferType = function() {
        $scope.offerResultsStart = 0;
        $scope.updateResults();
    };

    $scope.updateResults = function() {
        //console.log($scope.selectedOfferType);

        if($scope.checkboxModel.checked && (angular.isUndefined($scope.selectedOfferType) ||  $scope.selectedOfferType == "preselect"))
        {
            PraxisboerseService.getOffers($rootScope.restURL + "joboffer/notepad/0/-1");
        }

        else if($scope.selectedOfferType != "preselect") {
            //if($scope.mobileDevice == false)
            //PraxisboerseService.getOffers($rootScope.restURL + "joboffer/offers/" + $scope.selectedOfferType + "/0/-1");
            //else
            //{

            if($scope.checkboxModel.checked)
            {
                PraxisboerseService.getOffers($rootScope.restURL + "joboffer/notepad/" + $scope.selectedOfferType + "/" + $scope.offerResultsStart + "/" + $scope.offerResultsCount);
            }
            else
            {
                PraxisboerseService.getOffers($rootScope.restURL + "joboffer/offers/" + $scope.selectedOfferType + "/" + $scope.textfilter + $scope.offerResultsStart + "/" + $scope.offerResultsCount);
                PraxisboerseService.getOffers($rootScope.restURL + "joboffer/offers/" + $scope.selectedOfferType + "/" + $scope.offerResultsStart + "/" + $scope.offerResultsCount);
            }

            //}
        }

        if($scope.checkboxModel.checked == false && $scope.selectedOfferType == "preselect")
        {
            $scope.offers = '';
        }
    };

}]);


praxisboerse.controller('PopupInstanceController', ['$scope', '$uibModalInstance', 'selectedOffer',
    function($scope, $uibModalInstance, selectedOffer) {

    $scope.selectedOffer = selectedOffer;

    $scope.ok = function () {
        $uibModalInstance.close();
    };

    //$scope.cancel = function () {
    //    $uibModalInstance.dismiss('cancel');
    //};
}]);

praxisboerse.directive('praxisboerseView', function() {
    return {
        scope: {
            url: '@url'
        },
        templateUrl: 'praxisboerse/praxisboerseTemplate.html',
        restrict: 'E',
        controller: 'PraxisboerseController',
        link: function(scope, element, attrs) {
        }
    };
});

praxisboerse.directive('popupTemplate', function() {
   return {
       templateUrl: 'praxisboerse/popupTemplate.html',
       controller: 'PraxisboerseController',
       replace: true
   };
});

//praxisboerse.directive('notepadView', function() {
//    return {
//        scope: {
//            url: '@url'
//        },
//        templateUrl: 'praxisboerse/notepadTemplate.html',
//        restrict: 'E',
//        controller: 'PraxisboerseNotepadController',
//        link: function(scope, element, attrs) {
//        }
//    };
//});
