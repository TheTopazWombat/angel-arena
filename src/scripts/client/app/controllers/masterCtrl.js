angular.module("angel-arena").controller("masterCtrl", ['$scope', 'masterService', ($scope, masterService) => {

    $scope.test = `kika is a buttlicker`;
    $scope.getAllCards = () => {
        masterService.getAllCards().then(response => {
            console.log(response);
            $scope.allCards = response;
        });
    };

    

}]);
