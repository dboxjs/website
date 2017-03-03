(function() {
  'use strict';

  angular
    .module('dboxLibrary')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main'
      })

    .state('dev', {
        url: '/dev',
        templateUrl: 'app/dev/dev.html',
        controller: 'devController',
        controllerAs: 'dev'
      })
    .state('mapRounded',{
        url: '/map-rounded',
        templateUrl: 'app/components/map-rounded/mapRounded.html',
        controller: 'MapRoundedController',
        controllerAs: 'rounded'
    })

    .state('chart', {
        url: '/chart/:chart_id',
        templateUrl: 'app/chart/chart.html',
        controller: 'ChartController',
        controllerAs: 'chart'
      });

    $urlRouterProvider.otherwise('/');
  }

})();
