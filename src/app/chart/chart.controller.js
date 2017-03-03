(function() {
  'use strict';

  angular
    .module('dboxLibrary')
    .controller('ChartController', ChartController);

  /** @ngInject */
  function ChartController($timeout, toastr, $window, $languageService,$stateParams,$scope) {
    var vm = this;
    var dbox = $window.dbox;

    var codigos = [
    "var config = {\n          'bindTo': '#columns',\n          'style':'columns',\n          'size':{\n            'width':  555,\n            'height':400,\n            'margin':{top: 20, right: 55, bottom: 100, left: 40},\n          },\n          'template':'dbox-gray',\n          'chart':{\n            'title': 'Columns',\n            'subtitle':'',\n          },\n          'data':{\n            'raw': nested,\n            'sort':{\n              'axis': 'y',\n              'order': 'desc', // asc - 1, desc  -1 ,\n              //'visible':false,\n            },\n            parser:function(d) {\n              var n = {};\n              n.x = +d.key;\n              n.y = +d.values;\n              n.color = '#fc3'\n              return n;\n            },\n            tip: function(d) {\n              return d.x.toFixed(0) +'<br>'+ d.y.toFixed(2);\n            },\n            mouseover: function(d){\n              var vm = this;\n              vm._chart._tip.show(d);\n            },\n            mouseout: function(d){\n              var vm = this;\n              vm._chart._tip.hide();\n            }\n          },\n          'xAxis':{\n            'scale' : 'linear',\n            'text'  : '',\n            'ticks':{\n              'enabled':true\n            }\n          },\n          'yAxis':{\n            'scale' : 'linear',\n            'text'  : '',//subcategory.title,\n            'ticks':{\n              'enabled':true,\n              'style':'straightLine'\n            }\n          },\n          'events':{\n            'load': function(bars){\n              var bar = bars.select(data.district_a);\n              if( bar !== false){\n                bar.attr('fill', '#da2b46')\n              };\n            }\n          },\n          'plotOptions':{\n            'bars':{\n\n            }\n          }\n        }\n\n        var bars = dbox.bars(config);\n        bars.generate();",
    "var config = {\n  'bindTo': '#scatter',\n  'size':{\n    'width': 555,\n    'height':400,\n    'margin':{top: 20, right: 50, bottom: 50, left: 50},\n  },\n  'template':'dbox-gray',\n  'chart':{\n    'title': 'Scatter',\n    'subtitle': '',\n  },\n  'data':{\n    'raw': data,\n    parser:function(d) {\n      d.color = 'steelblue';\n      return d;\n    },\n    tip:function(d) {\n      return d.name + '<br>('+ d.x.toFixed(2) +' ,'+ d.y.toFixed(2) +')';\n    },\n    mouseover: function(d){\n    },\n    mouseout: function(d){\n    },\n  },\n  'xAxis':{\n    'scale' : 'linear',\n    'text': ''//subcategory.title\n  },\n  'yAxis':{\n    'visible':true,\n    'scale' : 'linear',\n    'text': '',//layer.first.variable.title\n    'ticks':{\n      'enabled':true\n    }\n  },\n  'plotOptions':{\n    'scatter':{\n      'draw45Line':false\n    }\n  }\n}\n\nvar scatter = dbox.scatter(config);\nscatter.generate();",
    "config = {\n          'bindTo': '#linesAndCircles',\n          'style':'lineAndCircles',\n          'size':{\n            'width': 555,\n            'height':400,\n            'margin':{top: 20, right: 50, bottom: 100, left: 40},\n          },\n          'template':'dbox-gray',\n          'chart':{\n            'title': 'Lines and circles',\n            'subtitle':'',\n          },\n          'data':{\n            'raw': nested,\n            'sort':{\n              'axis': 'y',\n              'order': 'desc', // asc - 1, desc  -1 ,\n              //'visible':false,\n            },\n            parser:function(d) {\n              var n = {};\n              n.x = +d.key;\n              n.y = +d.values;\n              n.color = '#fda709'\n              return n;\n            },\n            tip:function(d) {\n              return d.x +'<br>'+ d.y.toFixed(2);\n            },\n            'highlight':{\n              'axis':'x',\n              'value':'Lower Dir'\n            },\n            mouseover: function(d){\n              var vm = this;\n              vm._chart._tip.show(d);\n            },\n            mouseout: function(d){\n              var vm = this;\n              vm._chart._tip.hide();\n            },\n          },\n          'xAxis':{\n            'scale' : 'ordinal',\n            'text'  : '',\n          },\n          'yAxis':{\n            'scale' : 'linear',\n            'text'  : '',//subcategory.title,\n            'ticks':{\n              'enabled':true,\n              'style':'straightLine'\n            }\n          },\n          'events':{\n            'load': function(bars){\n              //console.log('chart loaded',bars);\n            }\n          }\n\n        }\n\n        var linesAndCircles = dbox.bars(config);\n        linesAndCircles.generate();",
    "var config = {\n  'bindTo': '#map',\n  'chart':{\n    'background':{\n      'color':'transparent'\n    }\n  },\n  'data':{\n    'raw': vm.dataMap,\n    'sort':{\n      'axis': 'y',\n      'order': 'desc' // asc - 1, desc  -1 ,\n      //'visible':false,\n    },\n    'parser':function(d){\n      var n = {};\n\n      n.id = d._id;\n      n.Estado = d._id;\n      n.z = d.count;\n      return n;\n    },\n    /*'filter':function(d) {\n      return true; //Ignore national values\n    },*/\n    tip:function(d) {\n      console.log(d);\n      var html = '';\n      var total = d3.select('#map svg path#state-'+d.id).attr('data-total');\n\n      html+=d.properties.state_name;\n      if(total % 1 === 0)\n        html+='<br>'+ d3.format(',.0f')(total);\n      else\n        html+='<br>'+ d3.format',.2f')(total);\n\n      return html;\n    },\n    mouseover:function(d,i){\n    },\n    click:function(d,i){\n      console.log(d);\n    }\n  },\n  'events':{\n    'load': function _mapLoaded(chart){\n\n    }\n  },\n  'legend':{\n    'width':210,\n    'fill':'#ececec'\n  },\n  'size':{\n    'width':  width ? width : 555,\n    'height': 440,//$d4db.data.reduceHeight ? 500 : 650,\n    'margin':{top: -5, right: 20, bottom: 90, left: 20},\n    'scale': .95,//setScale(),\n    'translateX': width/5\n  },\n  'template':'dbox-gray',\n  'plotOptions':{\n    'map':{\n      'geo':'mexico',\n      'geoDivision':'states',\n      'units': 'total',//'percentage',\n      'quantiles':{\n        'buckets':5,\n        'colors': [ '#fff', '#cddae6', '#9ab5cd','#688fb4',  '#356a9b' ],\n        'outOfRangeColor': '#969696'\n      }\n    }\n  }\n};\n\nvar map = dbox.map(config);\nmap.generate();",
    "var generalConfig = {};\nvar mapConfig = {\ntarget: '#map-wrapper',\nidentifierKey: 'ent_regis',\nzoom:{\navailable: true,\nzoomRange: [1, 5]\n}\n};\ngeneralConfig.mapConfig = mapConfig;\nvar circlesConfig = {\nminPadding: 8,\nradius: 4,\nstyle:{\nfill: '#C1D200',\nstrokeColor: 'white',\nstrokeWidth: 2,\n}\n};\ngeneralConfig.circlesConfig = circlesConfig;\nvar tipConfig = {\nclasses: 'rounded-map-tip-states',\nhtml: function(content){\nreturn content.ent_nom;\n}\n};\ngeneralConfig.tipConfig = tipConfig;\nvar callbackConfig = {\nclick: function(param){\nconsole.log('this is a click callback');\n},\nover: function(param){\nconsole.log('this is an over callback');\n},\nout: function(param){\nconsole.log('this is an out callback');\n}\n};\ngeneralConfig.callbackConfig = callbackConfig;\nvar domain = [];\nvar colorsRange = ['#88C2A8','#78A79C','#4F677F','#4F677F','191F50'];\nd3.csv('assets/data/mapa_todo.csv',drawMap);\nfunction drawMap(error,data){\nconsole.log(data);\ndata.forEach(function(d){\nvar numAux = Number(d.tasa).toFixed(2);\ndomain.push( +numAux );\n});\ndbox.MexicoMapRounded(generalConfig).bindTo('#svgMapContainer').drawMap(data).colorStates(domain,colorsRange,fillCallback);\n}\nfunction returnTasa(d){\nreturn d.tasa;\n}\nfunction fillCallback(self,own,testScale){\nvar found = null;\nfor(var x = 0;x<self._data.length;x++){\nif('est_' + self._data[x].key === own.id){\nfound = self._data[x].values[0];\nbreak;\n}\n}\nreturn (found) ? testScale(found.tasa) : '#000';\n}",
    "function chart2(){}",
    "function chart2(){}",
    "function chart2(){}",
    "function chart2(){}",
    "function chart2(){}",
    "function chart2(){}",
    "function chart2(){}",
    "function chart2(){}",
    "function chart3(){}"]
    vm.graficas = ['columns', 'scatter', 'linesAndCircles', 'map'];

    var nested = [{key:5,values:10},{key:10,values:20},{key:15,values:30},{key:20,values:40},{key:25,values:50}];

    var config = {
          'bindTo': '#grafica-columns',
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
              //'visible':false,
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
            'scale' : 'linear',
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
              /*var bar = bars.select(data.district_a);
              if( bar !== false){
                bar.attr('fill', '#da2b46')
              };*/
            }
          },
          'plotOptions':{
            'bars':{

            }
          }
        }

        $timeout(function(){
          var bars = dbox.bars(config);
        bars.generate();
      },1000)




    var myCodeMirror = CodeMirror(document.getElementById('coder'), {
    value: codigos[$stateParams.chart_id - 1],
    mode:  "javascript",
    readOnly: false,
    theme: 'base16-light',
    lineWrapping: true,
    lineNumbers: true,
  });


    var pageWidth = $window.screen.availWidth;
    vm.mobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || pageWidth < 620 && pageWidth > 0) ? true : false;
    vm.data = $languageService.data;
    console.log($stateParams.chart_id);
    vm.chartNumber = $stateParams.chart_id;
   //vm.data.language cambia a 'english' o 'spanish' segun se seleccione en el navbar
  }
})();
