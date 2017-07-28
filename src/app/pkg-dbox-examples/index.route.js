(function() {
  'use strict';

  angular
    .module('dbox')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider) {
    $stateProvider
      .state('dbox', {
        url: '/dbox',
        templateUrl: 'app/pkg-dbox-examples/index.html',
      })
      .state('dbox.bars', {
        url: '/bar',
        templateUrl: 'app/pkg-dbox-examples/bar/bar.html',
        controller: 'BarController',
        controllerAs: 'vm'
      })
      .state('dbox.scatter', {
        url: '/scatter',
        templateUrl: 'app/pkg-dbox-examples/scatter/scatter.html',
        controller: 'ScatterController',
        controllerAs: 'vm'
      })
      .state('dbox.map', {
        url: '/map',
        templateUrl: 'app/pkg-dbox-examples/map/map.html',
        controller: 'MapController',
        controllerAs: 'vm'
      })
      .state('dbox.timeline', {
        url: '/timeline',
        templateUrl: 'app/pkg-dbox-examples/timeline/timeline.html',
        controller: 'TimelineController',
        controllerAs: 'vm'
      })
      .state('dbox.heatmap', {
        url: '/heatmap',
        templateUrl: 'app/pkg-dbox-examples/heatmap/heatmap.html',
        controller: 'HeatmapController',
        controllerAs: 'vm'
      })
      .state('dbox.treemap', {
        url: '/treemap',
        templateUrl: 'app/pkg-dbox-examples/treemap/treemap.html',
        controller: 'TreemapController',
        controllerAs: 'vm'
      })
      .state('dbox.radar', {
        url: '/radar',
        templateUrl: 'app/pkg-dbox-examples/radar/radar.html',
        controller: 'radarController',
        controllerAs: 'vm'
      })


  }

})();
