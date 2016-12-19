angular.module('angel-arena')
    .config(($stateProvider, $urlRouterProvider) => {
        $urlRouterProvider
            .otherwise('/');
        $stateProvider
            .state('landing', {
                url: '/',
                templateUrl: './assets/landing.html'
            })
            .state('tournaments', {
                url: '/tournaments',
                templateUrl: './assets/tournaments.html'
            })
    });