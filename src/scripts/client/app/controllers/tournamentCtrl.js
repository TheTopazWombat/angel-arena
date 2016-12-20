angular.module('angel-arena')
    .controller('tournamentCtrl', ['$scope', 'masterService', ($scope, masterService) => {
        $scope.tournaments = masterService.tournaments;
        $scope.addTournament = (t) => {
            masterService.tournaments.push(t);
            console.log($scope.tournaments);
        };
        $scope.test = "Kika is a buttlicker";
        console.log($scope.tournaments);
    }]);