(function() {
  'use strict';

  angular
    .module('dbox')
    .controller('radarController', radarController);

  /** @ngInject */
  function radarController($timeout) {
    var vm = this;

    var d = [
        {cat: 'Children', axis:"Email",value:0.59},
        {cat: 'Children', axis:"Social Networks",value:0.56},
        {cat: 'Children', axis:"Internet Banking",value:0.42},
        {cat: 'Children', axis:"News Sportsites",value:0.34},
        {cat: 'Children', axis:"Search Engine",value:0.48},
        {cat: 'Children', axis:"View Shopping sites",value:0.14},
        {cat: 'Children', axis:"Paying Online",value:0.11},
        {cat: 'Children', axis:"Buy Online",value:0.05},
        {cat: 'Children', axis:"Stream Music",value:0.07},
        {cat: 'Children', axis:"Online Gaming",value:0.12},
        {cat: 'Children', axis:"Navigation",value:0.27},
        {cat: 'Children', axis:"App connected to TV program",value:0.03},
        {cat: 'Children', axis:"Offline Gaming",value:0.12},
        {cat: 'Children', axis:"Photo Video",value:0.4},
        {cat: 'Children', axis:"Reading",value:0.03},
        {cat: 'Children', axis:"Listen Music",value:0.22},
        {cat: 'Children', axis:"Watch TV",value:0.03},
        {cat: 'Children', axis:"TV Movies Streaming",value:0.03},
        {cat: 'Children', axis:"Listen Radio",value:0.07},
        {cat: 'Children', axis:"Sending Money",value:0.18},
        {cat: 'Children', axis:"Other",value:0.07},
        {cat: 'Children', axis:"Use less Once week",value:0.08},
        {cat: 'Adults', axis:"Email",value:0.48},
        {cat: 'Adults', axis:"Social Networks",value:0.41},
        {cat: 'Adults', axis:"Internet Banking",value:0.27},
        {cat: 'Adults', axis:"News Sportsites",value:0.28},
        {cat: 'Adults', axis:"Search Engine",value:0.46},
        {cat: 'Adults', axis:"View Shopping sites",value:0.29},
        {cat: 'Adults', axis:"Paying Online",value:0.11},
        {cat: 'Adults', axis:"Buy Online",value:0.14},
        {cat: 'Adults', axis:"Stream Music",value:0.05},
        {cat: 'Adults', axis:"Online Gaming",value:0.19},
        {cat: 'Adults', axis:"Navigation",value:0.14},
        {cat: 'Adults', axis:"App connected to TV program",value:0.06},
        {cat: 'Adults', axis:"Offline Gaming",value:0.24},
        {cat: 'Adults', axis:"Photo Video",value:0.17},
        {cat: 'Adults', axis:"Reading",value:0.15},
        {cat: 'Adults', axis:"Listen Music",value:0.12},
        {cat: 'Adults', axis:"Watch TV",value:0.1},
        {cat: 'Adults', axis:"TV Movies Streaming",value:0.14},
        {cat: 'Adults', axis:"Listen Radio",value:0.06},
        {cat: 'Adults', axis:"Sending Money",value:0.16},
        {cat: 'Adults', axis:"Other",value:0.07},
        {cat: 'Adults', axis:"Use less Once week",value:0.17}
      ];

      var cfg = {
        bindTo: '#chart',
        size: {
          width: 800,
          height: 600,
          margin: {
            top: 40,
            bottom: 40,
            left: 30,
            right: 30
          },
        },
        data: {raw: d.map(function(it) {
          it.hundreds = it.value * 100;
          return it;
        })},
        axesFrom: 'axis',
        polygonsFrom: 'cat',
        valuesFrom: 'hundreds',
        colors: ['red', 'blue'],
        ticks: 5,
        xAxis: {enabled: false},
        yAxis: {enabled: false}
      };

      var chrt = dbox.chart(cfg)
        .layer(dbox.radar)
        .end()
        .draw();


    d3.select("#code").select("code")
      .each(function(d) {
        var code = d3.select(this);
          d3.text("/app/pkg-dbox-examples/radar/radar.code.html", function(error, content) {
            if (error) content = "Sorry, an error occurred.";
            code.text(content);
            hljs.highlightBlock(code.node());
          });
        })

    d3.select("#data").select("code")
      .each(function(d) {
        var code = d3.select(this);
          d3.text("/app/pkg-dbox-examples/radar/radar.data.tsv", function(error, content) {
            if (error) content = "Sorry, an error occurred.";
            code.html(content);
          });
        })

  }
})();

