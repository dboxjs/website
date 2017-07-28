(function() {
  'use strict';

  angular
    .module('dbox')
    .controller('ScatterController', ScatterController);

  /** @ngInject */
  function ScatterController($timeout) {
    var vm = this;

    /*d3.select("#code").select("code")
      .each(function(d) {
        var code = d3.select(this);
          d3.text("/app/pkg-dbox-examples/scatter/scatter.code.html", function(error, content) {
            if (error) content = "Sorry, an error occurred.";
            code.text(content);
            hljs.highlightBlock(code.node());
          });
        })*/


    d3.select("#code")
      .each(function(d){
        var code = d3.select(this);
        d3.text("/app/pkg-dbox-examples/scatter/scatter.code.html", function(error, content) {
          if (error) content = "Sorry, an error occurred.";
          console.log(content);
          code.html(new showdown.Converter().makeHtml(content));
          code.selectAll("code").each(function() { hljs.highlightBlock(this); });
        });
      })

    d3.select("#data").select("code")
      .each(function(d) {
        var code = d3.select(this);
          d3.text("/assets/data/data.tsv", function(error, content) {
            if (error) content = "Sorry, an error occurred.";
            code.html(content);
          });
        })

  }
})();

