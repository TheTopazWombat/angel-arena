angular.module('angel-arena')
    .config(($stateProvider, $urlRouterProvider) => {
        $urlRouterProvider
            .otherwise('/');
        $stateProvider
            .state('landing', {
                url: '/',
                templateUrl: './assets/views/landing.html'
            })
            .state('tournaments', {
                url: '/tournaments',
                templateUrl: './assets/views/tournaments.html',
                controller: 'tournamentCtrl'
            })
    });