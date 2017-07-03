(function() {
  'use strict';

  angular
    .module('dbox')
    .controller('TimelineController', TimelineController);

  /** @ngInject */
  function TimelineController($timeout) {
    var vm = this;

    d3.select("#code").select("code")
      .each(function(d) {
        var code = d3.select(this);
          d3.text("/app/pkg-dbox-examples/timeline/timeline.code.html", function(error, content) {
            if (error) content = "Sorry, an error occurred.";
            code.text(content);
            hljs.highlightBlock(code.node());
          });
        });
    
    d3.select("#data").select("code")
      .each(function(d) {
        var code = d3.select(this);
          d3.text("/app/pkg-dbox-examples/data/airbus_data.tsv", function(error, content) {
            if (error) content = "Sorry, an error occurred.";
            code.html(content);
          });
        });




  }
})();

