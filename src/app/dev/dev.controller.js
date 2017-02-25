(function() {
  'use strict';

  angular
    .module('dboxLibrary')
    .controller('devController', devController);

  /** @ngInject */
  function devController() {
    var vm = this;

    var nested = [{key:5,values:10},{key:10,values:20},{key:15,values:30},{key:20,values:40},{key:25,values:50}];

    var config = {
          'bindTo': '#chart',
          'style':'columns',
          'size':{
            'width':  555,
            'height':400,
            'margin':{top: 20, right: 55, bottom: 100, left: 40},
          },
          'template':'dbox-gray',
          'chart':{
            'title': 'Columns',
            'subtitle':'',
          },
          'data':{
            'raw': nested,
            'sort':{
              'axis': 'y',
              'order': 'desc', // asc - 1, desc  -1 ,
            },
            parser:function(d) {
              var n = {};
              n.x = d.key;
              n.y = d.values;
              n.color = '#fc3'
              console.log(n)
              return n;
            },
            tip: function(d) {
              return d.x.toFixed(0) +'<br>'+ d.y.toFixed(2);
            },
            mouseover: function(d){
              var vm = this;
              vm._chart._tip.show(d);
            },
            mouseout: function(d){
              var vm = this;
              vm._chart._tip.hide();
            }
          },
          'xAxis':{
            'scale' : 'ordinal',
            'text'  : '',
            'ticks':{
              'enabled':true
            }
          },
          'yAxis':{
            'scale' : 'linear',
            'text'  : '',//subcategory.title,
            'ticks':{
              'enabled':true,
              'style':'straightLine'
            }
          },
          'events':{
            'load': function(bars){
            }
          },
          'plotOptions':{
            'bars':{

            }
          }
    }

    var bars = dbox.bars(config);
    bars.generate();

  }
})();
