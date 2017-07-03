(function() {
  'use strict';

  angular
    .module('dbox')
    .controller('ScatterController', ScatterController);

  /** @ngInject */
  function ScatterController($timeout) {
    var vm = this;

    var config = {
      'bindTo': '#chart',
      'size':{
        'width':960,
        'height':500,
        'margin':{top: 20, right: 20, bottom: 30, left: 40},
      },
      'xAxis' : {
        enabled: true,
        scale: 'linear'
      },
      'yAxis': {
        enabled:true,
        scale: 'linear'
      }
    }

    var chart = dbox.chart(config)
                  .data({'tsv':'app/pkg-dbox-examples/data/data.tsv'})
                .layer(dbox.scatter)
                  .x('sepalWidth')
                  .y('sepalLength')
                  .color('species')
                  .tip(function(d){
                    console.log(d);
                    return  'alecs';
                  })
                .end()
                  .draw();


    d3.select("#code").select("code")
      .each(function(d) {
        var code = d3.select(this);
          d3.text("/app/pkg-dbox-examples/scatter/scatter.code.html", function(error, content) {
            if (error) content = "Sorry, an error occurred.";
            code.text(content);
            hljs.highlightBlock(code.node());
          });
        })

    /*d3.select("#code")
      .each(function(d){
        var code = d3.select(this);
        d3.text("/app/pkg-dbox-examples/scatter/scatter.code.html", function(error, content) {
          if (error) content = "Sorry, an error occurred.";
          console.log(content);
          code.html(new showdown.Converter().makeHtml(content));
          code.selectAll("code").each(function() { hljs.highlightBlock(this); });
        });
      })*/

    d3.select("#data").select("code")
      .each(function(d) {
        var code = d3.select(this);
          d3.text("/app/pkg-dbox-examples/scatter/scatter.data.tsv", function(error, content) {
            if (error) content = "Sorry, an error occurred.";
            code.html(content);
          });
        })

  }
})();

