angular.module('angel-arena')
    .directive('header', () => {
        return {
            templateUrl: './assets/directivetemplates/header.html',
            restrict: 'AE'
        };
    });