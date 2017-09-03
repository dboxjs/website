(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('cartodb')) :
  typeof define === 'function' && define.amd ? define(['exports', 'cartodb'], factory) :
  (factory((global.dbox = global.dbox || {}),global.cartodb));
}(this, (function (exports,cartodb) { 'use strict';

/*
 * CartoDB helper function
 */

function carto() {

  function carto() {}

  carto.query = function (config, callback) {
    //Config the cartdb User
    var sql = new cartodb.SQL({ user: config.cartodb.user });
    //Execute the query
    sql.execute(config.cartodb.sql).done(function (data) {

      var result = data.rows;
      //parse the data
      if (config.parser) {
        result = data.rows.map(config.parser);
      }
      //execute the callback with no error
      callback(null, result);
    }).error(function (error) {
      //Return the error
      callback(error, null);
    });
  };

  return carto;
}

/*
 * Dbox Chart core
 */

var chart = function (config) {

  function Chart(config) {
    var vm = this;
    var defaultConfig = { size: { width: 800, height: 600, margin: { left: 0, right: 0, top: 0, bottom: 0 } } };
    vm._config = config ? _.cloneDeep(config) : defaultConfig;
    vm._data = [];
    vm._margin = vm._config.size.margin;

    //Define width and height
    vm._width = vm._config.size.width - vm._margin.left - vm._margin.right;
    vm._height = vm._config.size.height - vm._margin.top - vm._margin.bottom;
    vm._svg = '';
    vm._scales = {};
    vm._axes = {};

    //Public
    vm.layers = [];
  }
  //------------------------
  //User
  Chart.prototype.config = function (config) {
    var vm = this;
    vm._config = _.cloneDeep(config);
    return vm;
  };

  Chart.prototype.size = function (sizeObj) {
    var vm = this;
    if (sizeObj) {
      if (sizeObj.margin) {
        if (sizeObj.margin.left == Number(sizeObj.margin.left)) {
          vm._config.size.margin.left = sizeObj.margin.left;
          vm._margin.left = sizeObj.margin.left;
        }
        if (sizeObj.margin.right == Number(sizeObj.margin.right)) {
          vm._config.size.margin.right = sizeObj.margin.right;
          vm._margin.right = sizeObj.margin.right;
        }
        if (sizeObj.margin.top == Number(sizeObj.margin.top)) {
          vm._config.size.margin.top = sizeObj.margin.top;
          vm._margin.top = sizeObj.margin.top;
        }
        if (sizeObj.margin.bottom == Number(sizeObj.margin.bottom)) {
          vm._config.size.margin.bottom = sizeObj.margin.bottom;
          vm._margin.bottom = sizeObj.margin.bottom;
        }
      }
      if (sizeObj.width == Number(sizeObj.width)) {
        vm._config.size.width = sizeObj.width;
        vm._width = sizeObj.width;
      }
      if (sizeObj.height == Number(sizeObj.height)) {
        vm._config.size.height = sizeObj.height;
        vm._height = sizeObj.height;
      }
    }
    return vm;
  };

  Chart.prototype.grid = function (bool) {
    var vm = this;
    vm._config.grid = bool ? true : false;
    return vm;
  };

  Chart.prototype.bindTo = function (selector) {
    var vm = this;
    vm._config.bindTo = selector;
    return vm;
  };

  Chart.prototype.data = function (data) {
    var vm = this;
    vm._config.data = data;
    return vm;
  };

  Chart.prototype.layer = function (_layer, _config) {
    var vm = this;
    var layer;
    var config = _config ? _config : vm._config;
    if (_layer === undefined && _layer === null) {
      //@Todo Throw Error
    } else {
      layer = _layer(config);
      layer.chart(vm);
      vm.layers.push(layer);
      return layer;
    }
  };

  Chart.prototype.getLayer = function (layerIndex) {
    var vm = this;
    return vm.layers[layerIndex];
  };

  Chart.prototype.draw = function () {
    var vm = this,
        q;
    vm._scales = vm.scales();
    vm._axes = vm.axes();

    q = vm.loadData();

    q.await(function (error, data) {
      if (error) throw error;

      vm._data = data;
      vm.drawSVG();

      vm.drawGraphs();
      vm.drawAxes();

      //Trigger load chart event
      if (vm._config.events && vm._config.events.load) {
        vm.dispatch.on("load.chart", vm._config.events.load(vm));
      }
    });
    return vm;
  };

  //----------------------
  //Helper functions
  Chart.prototype.scales = function () {
    var vm = this;

    var scales = {};

    //xAxis scale
    if (vm._config.xAxis && vm._config.xAxis.scale) {
      switch (vm._config.xAxis.scale) {
        case 'linear':
          scales.x = d3.scaleLinear().range([0, vm._width]);
          break;

        case 'time':
          scales.x = d3.scaleTime().range([0, vm._width]);
          break;

        case 'ordinal':
          scales.x = d3.scaleOrdinal().range([0, vm._width], 0.1);
          break;

        case 'band':
          scales.x = d3.scaleBand().rangeRound([0, vm._width]).padding(0.1);
          break;

        case 'quantile':
          scales.x = d3.scaleOrdinal().range([0, vm._width], 0.1);

          scales.q = d3.scaleQuantile().range(d3.range(vm._config.xAxis.buckets));
          break;

        default:
          scales.x = d3.scaleLinear().range([0, vm._width]);
          break;
      }
    } else {
      scales.x = d3.scaleLinear().range([0, vm._width]);
    }

    //yAxis scale
    if (vm._config.yAxis && vm._config.yAxis.scale) {
      switch (vm._config.yAxis.scale) {
        case 'linear':
          scales.y = d3.scaleLinear().range([vm._height, 0]);
          break;

        case 'time':
          scales.y = d3.scaleTime().range([vm._height, 0]);
          break;

        case 'ordinal':
          scales.y = d3.scaleOrdinal().range([vm._height, 0], 0.1);
          break;

        case 'band':
          scales.y = d3.scaleBand().rangeRound([vm._height, 0]).padding(0.1);
          break;

        case 'quantile':
          scales.y = d3.scaleOrdinal().range([0, vm._width], 0.1);

          scales.q = d3.scaleQuantile().range(d3.range(vm._config.yAxis.buckets));
          break;

        default:
          scales.y = d3.scaleLinear().range([vm._height, 0]);
          break;
      }
    } else {
      scales.y = d3.scaleLinear().range([vm._height, 0]);
    }

    scales.color = d3.scaleOrdinal(d3.schemeCategory10);

    return scales;
  };

  Chart.prototype.generateScale = function (data, config) {
    var vm = this;
    var scale = {};
    if (!config.range) {
      throw 'Range is not defined';
    }

    var domains = d3.extent(data, function (d) {
      return +d[config.column];
    });
    if (config.minZero) {
      domains = [0, d3.max(data, function (d) {
        return +d[config.column];
      })];
    }
    if (config.type) {
      switch (config.type) {
        case 'linear':
          scale = d3.scaleLinear().rangeRound(config.range).domain(domains);
          break;

        case 'time':
          scale = d3.scaleTime().range(config.range).domain(domains);
          break;

        case 'ordinal':
          scale = d3.scaleBand().rangeRound(config.range).padding(0.1).domain(data.map(function (d) {
            return d[config.column];
          }));
          break;

        case 'quantile':
          scale = d3.scaleBand().rangeRound(config.range).padding(0.1).domain(data.map(function (d) {
            return d[config.column];
          }));
          if (!config.bins) config.bins = 10;
          scale = d3.scaleQuantile().range(d3.range(config.bins));
          break;

        default:
          scale = d3.scaleLinear().rangeRound(config.range).domain(domains);
          break;
      }
    } else {
      scale = d3.scaleLinear().rangeRound(config.range).domain(domains);
    }

    return scale;
  };

  Chart.prototype.axes = function () {
    var vm = this,
        axes = {};

    axes.x = d3.axisBottom(vm._scales.x);
    axes.y = d3.axisLeft(vm._scales.y);

    if (vm._config.yAxis && vm._config.yAxis.ticks && vm._config.yAxis.ticks.enabled === true && vm._config.yAxis.ticks.style) {

      switch (vm._config.yAxis.ticks.style) {
        case 'straightLine':
          axes.y.tickSize(-vm._width, 0);
          break;
      }
    }

    if (vm._config.yAxis && vm._config.yAxis.ticks && vm._config.yAxis.ticks.format) {
      axes.y.tickFormat(vm._config.yAxis.ticks.format);
    }
    return axes;
  };

  Chart.prototype.loadData = function () {
    var vm = this;
    var q;

    if (vm._config.data.tsv) {
      q = d3.queue().defer(d3.tsv, vm._config.data.tsv);
    }

    if (vm._config.data.json) {
      q = d3.queue().defer(d3.json, vm._config.data.json);
    }

    if (vm._config.data.csv) {
      q = d3.queue().defer(d3.csv, vm._config.data.csv);
    }

    if (vm._config.data.raw) {
      q = d3.queue().defer(vm.mapData, vm._config.data.raw);
    }

    if (vm._config.data.cartodb) {
      q = d3.queue().defer(carto.query, vm._config.data);
    }

    if (vm._config.plotOptions && vm._config.plotOptions.bars && vm._config.plotOptions.bars.averageLines && Array.isArray(vm._config.plotOptions.bars.averageLines) && vm._config.plotOptions.bars.averageLines.length > 0) {

      vm._config.plotOptions.bars.averageLines.forEach(function (l) {
        if (l.data.cartodb) {
          q.defer(carto.query, l.data);
        }
      });
    }

    return q;
  };

  Chart.prototype.drawSVG = function () {
    var vm = this;

    //Remove any previous svg
    d3.select(vm._config.bindTo).select('svg').remove();
    d3.select(vm._config.bindTo).html('');

    //Add the css template class
    if (vm._config.template) {
      d3.select(vm._config.bindTo).classed(vm._config.template, true);
    }

    //Add title to the chart
    if (vm._config.chart && vm._config.chart.title) {
      d3.select(vm._config.bindTo).append("div").attr("class", "chart-title").html(vm._config.chart.title);
    }

    //Add Legend to the chart
    //@TODO - PASS THE STYLES TO DBOX.CSS
    //@TODO - ALLOW DIFFERENT POSSITIONS FOR THE LEGEND
    if (vm._config.legend && vm._config.legend.enable === true && vm._config.legend.position === 'top') {
      var legend = d3.select(vm._config.bindTo).append("div").attr("class", "chart-legend-top");

      var html = '';
      html += "<div style='background-color:#E2E2E1;text-align:center;height: 40px;margin: 0px 15px'>";
      vm._config.legend.categories.forEach(function (c) {
        html += "<div class='dbox-legend-category-title' style='margin:0 20px;'><span class='dbox-legend-category-color' style='background-color:" + c.color + ";'> </span><span style='height: 10px;float: left;margin: 10px 5px 5px 5px;border-radius: 50%;'>" + c.title + "</span></div>";
      });
      html += "</div>";
      legend.html(html);
    }

    //Create the svg
    vm._svg = d3.select(vm._config.bindTo).append("svg").style("font-size", vm._config.chart ? vm._config.chart['font-size'] ? vm._config.chart['font-size'] : '12px' : '12px').attr("width", vm._width + vm._margin.left + vm._margin.right).attr("height", vm._height + vm._margin.top + vm._margin.bottom).append("g").attr("transform", "translate(" + vm._margin.left + "," + vm._margin.top + ")");

    //Call the tip function
    /*if(vm._config.data.tip){
      vm._svg.call(vm._tip);
    }*/

    //Apply background color
    if (vm._config.chart && vm._config.chart.background && vm._config.chart.background.color) {
      d3.select(vm._config.bindTo + " svg").style('background-color', vm._config.chart.background.color);
    }

    var legendBottom = d3.select(vm._config.bindTo).append("div").attr("class", "chart-legend-bottom");
    //Legend for average lines
    /*
    if(vm._config.plotOptions && vm._config.plotOptions.bars
      && vm._config.plotOptions.bars.averageLines && Array.isArray(vm._config.plotOptions.bars.averageLines)
      && vm._config.plotOptions.bars.averageLines.length >0 ){
       d3.select(vm._config.bindTo).append("div")
        .attr("class", "container-average-lines")
        .append('div')
          .attr("class", "legend-average-lines")
        .html('Average Lines Controller')
    }
    */
  };

  Chart.prototype.drawGrid = function () {
    var vm = this;
    return vm;
  };

  Chart.prototype.drawAxes = function () {
    var vm = this;
    var xAxis, yAxis;

    if (!vm._config.xAxis || vm._config.xAxis && vm._config.xAxis.enabled !== false) {
      xAxis = vm._svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + vm._height + ")").call(vm._axes.x);
    }

    if (!vm._config.yAxis || vm._config.yAxis && vm._config.yAxis.enabled !== false) {
      yAxis = vm._svg.append("g").attr("class", "y axis").call(vm._axes.y);
    }

    /*xAxis.selectAll('text')
      .on("click",function(d,i){
        vm._config.xAxis.onclick.call(this, d, i);
      });*/

    if (vm._config.xAxis && vm._config.xAxis.text) {
      xAxis.append("text").attr("class", "label title").attr("x", vm._width / 2).attr("y", vm._config.xAxis.y ? vm._config.xAxis.y : 30).style("text-anchor", "middle").style("fill", vm._config.xAxis.fill ? vm._config.xAxis.fill : 'black').style("font-size", vm._config.xAxis['font-size'] ? vm._config.xAxis['font-size'] : '12px').style("font-weight", vm._config.xAxis['font-weight'] ? vm._config.xAxis['font-weight'] : '600').text(vm._config.xAxis.text);
    }

    if (vm._config.xAxis && vm._config.xAxis.dropdown && vm._config.xAxis.dropdown.enable === true) {
      var xAxisDropDown = d3.select(vm._config.bindTo).append("div").attr('class', 'dbox-xAxis-select').append("select").on("change", function () {
        vm.updateAxis('x', this.value);
      });

      xAxisDropDown.selectAll("option").data(vm._config.xAxis.dropdown.options).enter().append("option").attr("value", function (d) {
        return d.value;
      }).text(function (d) {
        return d.title;
      }).property("selected", function (d) {
        return d.selected;
      });
    }

    if (vm._config.yAxis && vm._config.yAxis.enabled !== false) {

      if (vm._config.yAxis && vm._config.yAxis.text) {
        yAxis.append("text").attr("class", "label title").attr("transform", "rotate(-90)").attr("y", vm._config.yAxis.y ? vm._config.yAxis.y : -50).attr("x", -150).attr("dy", ".71em").style("text-anchor", "middle").style("fill", vm._config.yAxis.fill ? vm._config.yAxis.fill : 'black').style("font-size", vm._config.yAxis['font-size'] ? vm._config.yAxis['font-size'] : '12px').style("font-weight", vm._config.xAxis['font-weight'] ? vm._config.xAxis['font-weight'] : '600').text(vm._config.yAxis.text);
      }
    }

    if (vm._config.yAxis && vm._config.yAxis.dropdown && vm._config.yAxis.dropdown.enable === true) {
      var yAxisDropDown = d3.select(vm._config.bindTo).append("div").attr('class', 'dbox-yAxis-select').attr('style', function () {
        var x = -1 * d3.select(vm._config.bindTo).node().getBoundingClientRect().width / 2 + vm._chart._margin.left / 4;
        var y = -1 * d3.select(vm._config.bindTo).node().getBoundingClientRect().height / 2;
        return 'transform: translate(' + x + 'px,' + y + 'px) rotate(-90deg);';
      }).append("select").on("change", function () {
        vm.updateAxis('y', this.value);
      });

      yAxisDropDown.selectAll("option").data(vm._config.yAxis.dropdown.options).enter().append("option").attr("value", function (d) {
        return d.value;
      }).text(function (d) {
        return d.title;
      }).property("selected", function (d) {
        return d.selected;
      });
    }
  };

  Chart.prototype.drawGraphs = function () {
    var vm = this;
    vm.layers.forEach(function (gr) {
      gr.data(vm._data).scales(vm._scales).axes(vm._axes).domains().draw();

      //@TODO validate domains from multiple layers
      vm._scales = gr._scales;
    });
  };

  Chart.prototype.dispatch = d3.dispatch("load", "change");

  Chart.prototype.mapData = function (data, callback) {
    callback(null, data);
  };

  Chart.prototype.getDomains = function (data) {
    var vm = this;

    var domains = {};
    var minMax = [];
    var sorted = '';

    //Default ascending function
    var sortFunctionY = function sortFunctionY(a, b) {
      return d3.ascending(a.y, b.y);
    };
    var sortFunctionX = function sortFunctionX(a, b) {
      return d3.ascending(a.x, b.x);
    };

    //if applying sort
    if (vm._config.data.sort && vm._config.data.sort.order) {
      switch (vm._config.data.sort.order) {
        case 'asc':
          sortFunctionY = function sortFunctionY(a, b) {
            return d3.ascending(a.y, b.y);
          };
          sortFunctionX = function sortFunctionX(a, b) {
            return d3.ascending(a.x, b.x);
          };
          break;

        case 'desc':
          sortFunctionY = function sortFunctionY(a, b) {
            return d3.descending(a.y, b.y);
          };
          sortFunctionX = function sortFunctionX(a, b) {
            return d3.descending(a.x, b.x);
          };
          break;
      }
    }

    //xAxis
    if (vm._config.xAxis && vm._config.xAxis.scale) {
      switch (vm._config.xAxis.scale) {
        case 'linear':
          minMax = d3.extent(data, function (d) {
            return d.x;
          });
          domains.x = minMax;
          break;

        case 'time':
          minMax = d3.extent(data, function (d) {
            return d.x;
          });
          domains.x = minMax;
          break;

        case 'ordinal':

          //If the xAxis' order depends on the yAxis values
          if (vm._config.data.sort && vm._config.data.sort.axis === 'y') {
            sorted = data.sort(sortFunctionY);
          } else {
            sorted = data.sort(sortFunctionX);
          }

          domains.x = [];
          sorted.forEach(function (d) {
            domains.x.push(d.x);
          });

          break;

        case 'quantile':

          //The xAxis order depends on the yAxis values
          if (vm._config.data.sort && vm._config.data.sort.axis === 'y') {
            sorted = data.sort(sortFunctionY);
          } else {
            sorted = data.sort(sortFunctionX);
          }

          domains.q = [];
          sorted.forEach(function (d) {
            domains.q.push(d.x);
          });

          domains.x = d3.range(vm._config.xAxis.buckets);

          break;

        default:
          minMax = d3.extent(data, function (d) {
            return d.x;
          });
          domains.x = minMax;
          break;
      }
    } else {
      minMax = d3.extent(data, function (d) {
        return d.x;
      });
      domains.x = minMax;
    }

    //yAxis
    if (vm._config.yAxis && vm._config.yAxis.scale) {
      switch (vm._config.yAxis.scale) {
        case 'linear':
          minMax = d3.extent(data, function (d) {
            return d.y;
          });

          //Adjust for min values greater than zero
          //set the min value to -10%
          if (minMax[0] > 0) {
            minMax[0] = minMax[0] - (minMax[1] - minMax[0]) * .1;
          }
          domains.y = minMax;
          break;

        case 'time':
          minMax = d3.extent(data, function (d) {
            return d.y;
          });
          domains.y = minMax;
          break;

        case 'ordinal':
          if (vm._config.data.sort && vm._config.data.sort.axis === 'y') {

            var sorted = data.sort(function (a, b) {
              return d3.ascending(a.y, b.y);
            });
            domains.y = [];
            sorted.forEach(function (d) {
              domains.y.push(d.x);
            });
          } else {
            domains.y = d3.map(data, function (d) {
              return d.y;
            }).keys().sort(function (a, b) {
              return d3.ascending(a, b);
            });
          }

          break;

        default:
          minMax = d3.extent(data, function (d) {
            return d.y;
          });
          domains.y = minMax;
          break;
      }
    } else {
      minMax = d3.extent(data, function (d) {
        return d.y;
      });
      domains.y = minMax;
    }

    return domains;
  };

  Chart.prototype.destroy = function () {
    var vm = this;
    d3.select(vm._config.bindTo).html("");
  };

  return new Chart(config);
};

/*
 * Simple Bar chart
 */
var bars = function (config) {

  function Bars(config) {
    var vm = this;
    vm._config = config ? config : {};
    vm._data = [];
    vm._config.colorScale = d3.schemeCategory20c;
    vm._config._format = function (d) {
      if (d % 1 == 0) {
        return d3.format(",.0f")(d);
      } else if (d < 1 && d > 0) {
        return d3.format(",.2f")(d);
      } else {
        return d3.format(",.1f")(d);
      }
    };
    vm._scales = {};
    vm._axes = {};
    //vm._tip = d3.tip().attr('class', 'd3-tip tip-bars').html(vm._config.data.tip || function(d){ return d;});
    vm._tip = d3.tip().attr('class', 'd3-tip tip-treemap').direction('n').html(vm._config.tip || function (d) {
      return vm._config._format(d[vm._config.y]);
    });
  }

  //-------------------------------
  //User config functions
  Bars.prototype.x = function (columnName) {
    var vm = this;
    vm._config.x = columnName;
    return vm;
  };

  Bars.prototype.y = function (columnName) {
    var vm = this;
    vm._config.y = columnName;
    return vm;
  };

  Bars.prototype.color = function (columnName) {
    var vm = this;
    vm._config.color = columnName;
    return vm;
  };

  Bars.prototype.end = function () {
    var vm = this;
    return vm._chart;
  };

  Bars.prototype.colorScale = function (colorScale) {
    var vm = this;
    if (Array.isArray(colorScale)) {
      vm._config.colorScale = colorScale;
    } else {
      vm._scales.color = colorScale;
      vm._config.colorScale = colorScale.range();
    }
    return vm;
  };

  Bars.prototype.format = function (format) {
    var vm = this;
    if (typeof format == 'function' || format instanceof Function) vm._config._format = format;else vm._config._format = d3.format(format);
    return vm;
  };

  //-------------------------------
  //Triggered by the chart.js;
  Bars.prototype.chart = function (chart) {
    var vm = this;
    vm._chart = chart;
    return vm;
  };

  Bars.prototype.data = function (data) {
    var vm = this;
    vm._data = data.map(function (d) {
      if (d[vm._config.x] == Number(d[vm._config.x])) d[vm._config.x] = +d[vm._config.x];
      if (d[vm._config.y] == Number(d[vm._config.y])) d[vm._config.y] = +d[vm._config.y];
      return d;
    });
    return vm;
  };

  Bars.prototype.scales = function (s) {
    var vm = this;
    //vm._scales = s;
    /* Use
    * vm._config.x
    * vm._config.xAxis.scale
    * vm._config.y
    * vm._config.yAxis.scale
    * vm._data
    */
    /* Generate x scale */
    var config = {
      column: vm._config.x,
      type: vm._config.xAxis.scale,
      range: [0, vm._chart._width],
      minZero: true
    };
    vm._scales.x = vm._chart.generateScale(vm._data, config);

    /* Generate y scale */
    config = {
      column: vm._config.y,
      type: vm._config.yAxis.scale,
      range: [vm._chart._height, 0],
      minZero: true
    };
    vm._scales.y = vm._chart.generateScale(vm._data, config);
    vm._chart._scales.x = vm._scales.x;
    vm._chart._scales.y = vm._scales.y;

    if (!vm._scales.color) vm._scales.color = d3.scaleOrdinal(vm._config.colorScale);
    return vm;
  };

  Bars.prototype.axes = function (a) {
    var vm = this;
    vm._axes = a;
    return vm;
  };

  Bars.prototype.domains = function () {
    var vm = this;
    return vm;
  };

  Bars.prototype.draw = function () {
    var vm = this;
    vm._chart._svg.call(vm._tip);

    /*if(vm._config.xAxis.enabled) {
       vm._chart._svg.append("g")
          .attr("class", "xAxis axis")
          .attr("transform", "translate(0," + vm._chart._height + ")")
          .call(d3.axisBottom(vm._scales.x)
            .tickValues(vm._config.xAxis.tickValues)
            .tickFormat(vm._config.xAxis.tickFormat)
          );
        //vm._chart._svg.selectAll(".xAxis.axis text").attr("transform", "translate(0,10)rotate(-20)");
    }*/

    /*if(vm._config.yAxis.enabled) {
      if(vm._config.yAxis.position == 'right') {
        var yAxis = d3.axisRight(vm._scales.y)
              .ticks(vm._config.yAxis.ticks)
              .tickValues(vm._config.yAxis.tickValues)
              .tickFormat(vm._config.yAxis.tickFormat);
      } else {
        var yAxis = d3.axisLeft(vm._scales.y)
              .ticks(vm._config.yAxis.ticks)
              .tickValues(vm._config.yAxis.tickValues)
              .tickFormat(vm._config.yAxis.tickFormat);
      }
      var axisY = vm._chart._svg.append("g")
          .attr("class", "yAxis axis");
      if(vm._config.yAxis.position == 'right')
        axisY.attr("transform", "translate(" + vm._chart._width + ",0)");
      axisY.call(yAxis);
        /*
        Axis Title
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("text-anchor", "end")
          .text("Frequency");
        
    }*/

    vm._chart._svg.selectAll(".bar").data(vm._data).enter().append("rect").attr("class", "bar").attr("x", function (d) {
      return vm._config.xAxis.scale == 'linear' && vm._config.yAxis.scale == 'linear' ? 0 : vm._scales.x(d[vm._config.x]);
    }).attr("y", function (d) {
      return vm._scales.y(d[vm._config.y]);
    }).attr("width", function (d) {
      return vm._scales.x.bandwidth ? vm._scales.x.bandwidth() : vm._scales.x(d[vm._config.x]);
    }).attr("height", function (d) {
      return vm._chart._height - vm._scales.y(d[vm._config.y]);
    }).attr("fill", function (d) {
      return vm._scales.color(d[vm._config.color]);
    }).style("opacity", 0.9).on('mouseover', function (d) {
      vm._tip.show(d, d3.select(this).node());
    }).on('mouseout', function () {
      vm._tip.hide();
    }).on('click', function () {});
    return vm;
  };

  return new Bars(config);
};

/*
 * Heatmap Chart
 */

var heatmap = function (config) {

  function Heatmap(config) {
    var vm = this;
    vm._config = config ? config : {};
    vm._data = [];
    vm._scales = {};
    vm._axes = {};
    vm._gridSize = Math.floor(vm._config.size.width / 16);
    vm._legendElementWidth = vm._gridSize;

    vm._config._format = d3.format(",.1f");

    vm._tip = d3.tip().attr('class', 'd3-tip');
  }

  //-------------------------------
  //User config functions
  Heatmap.prototype.x = function (columns) {
    var vm = this;
    vm._config.x = columns;
    return vm;
  };

  Heatmap.prototype.y = function (columns) {
    var vm = this;
    vm._config.y = columns;
    return vm;
  };

  Heatmap.prototype.colors = function (colors) {
    var vm = this;
    vm._config.colors = colors;
    return vm;
  };

  Heatmap.prototype.tip = function (tip) {
    var vm = this;
    vm._config.tip = tip;
    vm._tip.html(vm._config.tip);
    return vm;
  };

  Heatmap.prototype.buckets = function (b) {
    var vm = this;
    vm._config.buckets = buckets;
    return vm;
  };

  Heatmap.prototype.end = function () {
    var vm = this;
    return vm._chart;
  };

  //-------------------------------
  //Triggered by the chart.js;
  Heatmap.prototype.chart = function (chart) {
    var vm = this;
    vm._chart = chart;
    return vm;
  };

  Heatmap.prototype.data = function (data) {
    var vm = this;
    vm._data = data.map(function (d) {
      var m = {
        y: d.edad_mujer,
        x: d.edad_hombre,
        value: +d.tot,
        percentage: +d.por
      };
      return m;
    });
    return vm;
  };

  Heatmap.prototype.scales = function (s) {
    var vm = this;
    vm._scales = s;
    return vm;
  };

  Heatmap.prototype.axes = function (a) {
    var vm = this;
    vm._axes = a;
    return vm;
  };

  Heatmap.prototype.domains = function () {
    var vm = this;
    return vm;
  };

  Heatmap.prototype.draw = function () {
    var vm = this;

    //Call the tip
    vm._chart._svg.call(vm._tip);

    if (vm._config.xAxis) {
      vm._config.xAxis.y = vm._config.y.length * vm._gridSize + 25;
    } else {
      vm._config.xAxis = { 'y': vm._config.y.length * vm._gridSize };
    }

    vm._dayLabels = vm._chart._svg.selectAll(".dayLabel").data(vm._config.y).enter().append("text").text(function (d) {
      return d;
    }).attr("x", 0).attr("y", function (d, i) {
      return i * vm._gridSize;
    }).style("text-anchor", "end").attr("transform", "translate(-6," + vm._gridSize / 1.5 + ")").attr("class", "dayLabel mono axis");
    //.attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

    vm._timeLabels = vm._chart._svg.selectAll(".timeLabel").data(vm._config.x).enter().append("text").text(function (d) {
      return d;
    }).attr("x", function (d, i) {
      return i * vm._gridSize;
    }).attr("y", vm._config.xAxis.y).style("text-anchor", "middle").attr("transform", "translate(" + vm._gridSize / 2 + ", -6)").attr("class", "timeLabel mono axis");
    //.attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });


    var colorScale = d3.scaleQuantile().domain([0, d3.max(vm._data, function (d) {
      return d.value;
    })]).range(vm._config.colors);

    var cards = vm._chart._svg.selectAll(".hour").data(vm._data, function (d) {
      return d.y + ':' + d.x;
    });

    cards.enter().append("rect").attr("x", function (d) {
      return vm._config.x.indexOf(d.x) * vm._gridSize;
    }).attr("y", function (d) {
      return vm._config.y.indexOf(d.y) * vm._gridSize;
    }).attr("rx", 4).attr("ry", 4).attr("class", "hour bordered").attr("id", function (d) {
      return 'x' + d.x + 'y' + d.y;
    }).attr("width", vm._gridSize).attr("height", vm._gridSize).on('mouseover', function (d, i) {
      /*if(vm._config.data.mouseover){
        vm._config.data.mouseover.call(vm, d,i);
      }*/
      vm._tip.show(d, d3.select(this).node());
    }).on('mouseout', function (d, i) {
      /*if(vm._config.data.mouseout){
        vm._config.data.mouseout.call(this, d,i);
      }*/
      vm._tip.hide(d, d3.select(this).node());
    }).on("click", function (d, i) {
      if (vm._config.data.onclick) {
        vm._config.data.onclick.call(this, d, i);
      }
    }).style("fill", vm._config.colors[0]).transition().duration(3000).ease(d3.easeLinear).style("fill", function (d) {
      return colorScale(d.value);
    });

    /*
      var legend = vm._chart._svg.selectAll(".legend")
          .data([0].concat(colorScale.quantiles()), function(d) { return d; });
       var lgroup = legend.enter().append("g")
          .attr("class", "legend");
       lgroup.append("rect")
          .attr("x", function(d, i) {  return vm._legendElementWidth * i; })
          .attr("y", vm._config.size.height - vm._config.size.margin.bottom*2)
          .attr("width", vm._legendElementWidth)
          .attr("height", vm._gridSize / 2)
          .style("fill", function(d, i) { return vm._config.colors[i]; });
       lgroup.append("text")
          .attr("class", "mono")
          .text(function(d) { return "≥ " + Math.round(d); })
          .attr("x", function(d, i) { return vm._legendElementWidth * i; })
          .attr("y", vm._config.size.height - vm._config.size.margin.bottom*2 + vm._gridSize);
       legend.exit().remove();*/
    return vm;
  };

  return new Heatmap(config);
};

/*
 * Build a radar chart.
 */

var radar = function (config) {
  function Radar(config) {
    var vm = this,
        size;

    vm.CIRCLE_RADIANS = 2 * Math.PI;

    // The first axis must be at the circle's top.
    vm.RADIANS_TO_ROTATE = vm.CIRCLE_RADIANS / -4;

    vm._config = config ? config : {};
    vm._data = [];
    vm._scales = {};
    vm._axes = {};
    vm._axesData = {};
    vm._filter = null;
    vm._minMax = [0, 0];
    vm._viewData = [];
    vm._colorMap = {};
    vm._ticks = 0;
    vm._scale = null;
    vm._excludedPolygons = [];

    // Set defaults.
    if (!vm._config.ticks) {
      vm._config.ticks = 10;
    }

    if (!vm._config.transitionDuration) {
      vm._config.transitionDuration = 400;
    }

    if (!vm._config.axisLabelMargin) {
      vm._config.axisLabelMargin = 24;
    }

    if (!vm._config.legend) {
      vm._config.legend = {
        enable: true
      };
    }

    if (!vm._config.legend.at) {
      vm._config.legend.at = {
        x: 20,
        y: 20
      };
    }

    if ('undefined' == typeof vm._config.styleDefaults) {
      vm._config.styleDefaults = true;
    }

    // Calculate basic data.
    size = vm._config.size;

    vm._center = {
      x: size.width / 2 - size.margin.left,
      y: size.height / 2 - size.margin.top
    };

    vm._radius = Math.min((size.width - size.margin.left - size.margin.right) / 2, (size.height - size.margin.top - size.margin.bottom) / 2);
  }

  // User API.

  Radar.prototype.polygonsFrom = function (column) {
    var vm = this;
    vm._config.polygonsFrom = column;
    return vm;
  };

  Radar.prototype.axesFrom = function (column) {
    var vm = this;
    vm._config.axesFrom = column;
    return vm;
  };

  Radar.prototype.valuesFrom = function (column) {
    var vm = this;
    vm._config.valuesFrom = column;
    return vm;
  };

  Radar.prototype.ticks = function (ticks) {
    var vm = this;
    vm._config.ticks = ticks;
    return vm;
  };

  Radar.prototype.colors = function (colors) {
    var vm = this;
    vm._config.colors = colors;
    return vm;
  };

  Radar.prototype.end = function () {
    var vm = this;
    return vm._chart;
  };

  // Internal helpers.

  Radar.prototype.drawTicks = function () {
    var vm = this,
        svg = vm._chart._svg,
        dur = vm._config.transitionDuration,
        sel;

    sel = svg.select('g.ticks');

    if (sel.empty()) {
      sel = svg.append('g').attr('class', 'ticks');
    }

    sel = sel.selectAll('circle.tick').data(
    // Add an explicit index for keying the chart with their original array
    // indexes, then reverse it so rendering occurs from bigger to smaller
    // circles, allowing to set a fill color to the concentric cirlces
    // without getting the more external cirlce capping all the others.
    vm._ticks.map(function (val, idx) {
      return [idx, val];
    }).reverse(), function (d) {
      return d[0];
    });

    sel.transition().duration(dur).attr('r', function (d) {
      return vm._scale(d[1]);
    });

    sel.enter().append('circle').classed('tick', true).attr('cx', vm._center.x).attr('cy', vm._center.y).style('fill', vm._ifStyleDefaults('none')).style('stroke', vm._ifStyleDefaults('gray')).attr('r', function (d) {
      return vm._scale(d[1]);
    }).attr('opacity', 0).transition().duration(dur).attr('opacity', 1);

    sel.exit().transition().duration(dur).attr('opacity', 0).remove();
  };

  Radar.prototype.drawTicksLabels = function () {
    var vm = this,
        svg = vm._chart._svg,
        margin = 2,
        dur = vm._config.transitionDuration,
        sel;

    sel = svg.select('g.ticks-labels');

    if (sel.empty()) {
      sel = svg.append('g').attr('class', 'ticks-labels');
    }

    sel = sel.selectAll('text.tick-label').data(vm._ticks);

    sel.transition().duration(dur).text(function (d) {
      return d;
    }).attr('y', function (d) {
      return vm._center.y - margin - vm._scale(d);
    });

    sel.enter().append('text').text(function (d) {
      return d;
    }).attr('class', 'tick-label').attr('x', vm._center.x + margin).attr('y', function (d) {
      return vm._center.y - margin - vm._scale(d);
    }).attr('fill', vm._ifStyleDefaults('gray')).style('font-family', vm._ifStyleDefaults('sans-serif')).attr('opacity', 0).transition().duration(dur).attr('opacity', 1);

    sel.exit().transition().duration(dur).attr('opacity', 0).remove();
  };

  Radar.prototype.extractAxes = function (data) {
    var result,
        vm = this,
        axes = vm._config.axesFrom,
        radiansPerAxis;

    result = data.reduce(function (prev, item) {
      return prev.indexOf(item[axes]) > -1 ? prev : prev.concat(item[axes]);
    }, []);

    radiansPerAxis = vm.CIRCLE_RADIANS / result.length;

    result = result.map(function (item, idx) {
      return {
        axis: item,
        rads: idx * radiansPerAxis + vm.RADIANS_TO_ROTATE
      };
    });

    return {
      list: result,
      hash: result.reduce(function (hashed, el) {
        hashed[el.axis] = el;
        return hashed;
      }, {})
    };
  };

  Radar.prototype.buildColorMap = function (data) {
    var vm = this,
        colors = vm._config.colors;
    return data.reduce(function (cMap, row) {
      var polyg = row[vm._config.polygonsFrom],
          cIdx = cMap.index.indexOf(polyg);

      if (cIdx == -1) {
        cIdx = cMap.index.push(polyg) - 1;
        cMap.hash[polyg] = colors[cIdx];
        cMap.list.push({ polygon: polyg, color: colors[cIdx] });
      }
      return cMap;
    }, { index: [], hash: {}, list: [] });
  };

  Radar.prototype.drawAxes = function () {
    var vm = this,
        svg = vm._chart._svg,
        duration = vm._config.transitionDuration,
        selection;

    selection = svg.selectAll('line.axis').data(vm._axesData.list, function (d) {
      return d.axis;
    });

    selection.enter().append('line').classed('axis', true).attr('x1', vm._center.x).attr('y1', vm._center.y).style('stroke', vm._ifStyleDefaults('gray')).attr('x2', vm._center.x).attr('y2', vm._center.y).transition().duration(duration).attr('x2', function (d) {
      return vm.xOf(d.rads, vm._radius + 8);
    }).attr('y2', function (d) {
      return vm.yOf(d.rads, vm._radius + 8);
    });

    selection.transition().duration(duration).attr('x2', function (d) {
      return vm.xOf(d.rads, vm._radius + 8);
    }).attr('y2', function (d) {
      return vm.yOf(d.rads, vm._radius + 8);
    });

    selection.exit().transition().duration(duration).attr('x2', vm._center.x).attr('y2', vm._center.y).remove();
  };

  Radar.prototype.drawAxesLabels = function () {
    var vm = this,
        svg = vm._chart._svg,
        duration = vm._config.transitionDuration,
        fromCenter = vm._radius + vm._config.axisLabelMargin,
        labels;

    labels = svg.selectAll('text.axis-label').data(vm._axesData.list, function (d) {
      return d.axis;
    });

    labels.transition().duration(duration).attr('x', function (d) {
      return vm.xOf(d.rads, fromCenter);
    }).attr('y', function (d) {
      return vm.yOf(d.rads, fromCenter);
    });

    labels.enter().append('text').attr('class', 'axis-label').attr('text-anchor', 'middle').attr('fill', vm._ifStyleDefaults('gray')).style('font-family', vm._ifStyleDefaults('sans-serif')).text(function (d) {
      return d.axis;
    }).attr('x', function (d) {
      return vm.xOf(d.rads, fromCenter);
    }).attr('y', function (d) {
      return vm.yOf(d.rads, fromCenter);
    }).attr('opacity', 0).transition().duration(duration).attr('opacity', 1);

    labels.exit().transition().duration(duration).attr('opacity', 0).remove();
  };

  Radar.prototype.drawPolygons = function () {
    var vm = this,
        data = vm._viewData,
        svg = vm._chart._svg,
        duration = vm._config.transitionDuration,
        groupedData,
        gs,
        gsExit,
        gsEnter;

    // Prepare the data.
    groupedData = data.reduce(function (bundle, row) {
      var polygIdx = bundle.keys.indexOf(row.polygon);
      if (polygIdx == -1) {
        polygIdx = bundle.keys.push(row.polygon) - 1;
        bundle.polygons.push({
          polygon: row.polygon,
          color: row.color,
          points: [],
          values: []
        });
      }
      bundle.polygons[polygIdx].values.push(row);
      bundle.polygons[polygIdx].points.push(row.xy.join(','));
      return bundle;
    }, { keys: [], polygons: [] }).polygons;

    gs = svg.selectAll('g.polygon-container').data(groupedData, function (d) {
      return d.polygon + '-container';
    });

    gsEnter = gs.enter().append('g').attr('class', 'polygon-container');

    gsExit = gs.exit();
    gsExit.transition().duration(duration).remove();

    vm._buildNestedPolygons(gs, gsEnter, gsExit);
    vm._buildNestedVertexes(gs, gsEnter, gsExit);
  };

  Radar.prototype._buildNestedVertexes = function (update, enter, exit) {
    var vm = this,
        duration = vm._config.transitionDuration,
        selector = 'circle.vertex',
        toUpdate;

    function appendHelper(selection) {
      selection.append('circle').attr('class', 'vertex').attr('cx', vm._center.x).attr('cy', vm._center.y).attr('r', 4).attr('fill', function (d) {
        return d.color;
      }).call(updateHelper).on('mouseover', function (d) {
        var x = d.xy[0] + 10,
            y = d.xy[1] - 10;
        vm._showTooltip(x, y, d.polygon, d.value);
      }).on('mouseout', function () {
        vm._hideTooltip();
      });
    }

    function removeHelper(selection) {
      selection.transition().duration(duration).attr('cx', vm._center.x).attr('cy', vm._center.y).remove();
    }

    function updateHelper(selection) {
      selection.transition().duration(duration).attr('cx', function (d) {
        return d.xy[0];
      }).attr('cy', function (d) {
        return d.xy[1];
      });
    }

    function dataFunc(d) {
      return d.values;
    }

    function keyFunc(d) {
      return d.polygon + '-' + d.axis;
    }

    toUpdate = update.selectAll(selector).data(dataFunc, keyFunc);

    toUpdate.call(updateHelper);

    toUpdate.enter().call(appendHelper);

    toUpdate.exit().call(removeHelper);

    enter.selectAll(selector).data(dataFunc, keyFunc).enter().call(appendHelper);

    exit.selectAll(selector).call(removeHelper);
  };

  /**
   * Draw a tooltip at the given X, Y possition.
   * @param  {int} x       The X coordinate
   * @param  {int} y       The Y coordinate
   * @param  {string} val1 The value to show as the first line
   * @param  {string} val2 The value to show in the second line
   * @return {selection}   Return the created tooltip as a D3 selection
   */
  Radar.prototype._showTooltip = function (x, y, val1, val2) {
    var tt,
        subtt,
        bg,
        bbox,
        padding = 2,
        vm = this,
        svg = vm._chart._svg;

    tt = svg.append('g').attr('class', 'tooltip').attr('opacity', 0);

    bg = tt.append('rect').attr('class', 'tooltip-background');

    subtt = tt.append('text').attr('y', y).attr('x', x).style('fill', vm._ifStyleDefaults('white')).style('font-family', vm._ifStyleDefaults('sans-serif'));

    subtt.append('tspan').text(val2);

    subtt.append('tspan').attr('dy', '-1.2em').attr('x', x).text(val1);

    bbox = tt.node().getBBox();

    bg.attr('x', bbox.x - padding).attr('y', bbox.y - padding).attr('width', bbox.width + padding * 2).attr('height', bbox.height + (padding + 2)).style('fill', vm._ifStyleDefaults('gray'));

    tt.transition().duration(200).attr('opacity', .9);

    return tt;
  };

  /**
   * Remove the tooltip created by _showTooltip()
   * @return {undefined}
   */
  Radar.prototype._hideTooltip = function () {
    this._chart._svg.selectAll('g.tooltip').transition().duration(200).attr('opacity', 0).remove();
  };

  Radar.prototype._buildNestedPolygons = function (update, enter, exit) {
    var vm = this,
        duration = vm._config.transitionDuration,
        selector = 'polygon.category',
        toUpdate;

    // Used for the transitions where the polygons expand from
    // or shrink to the center.
    function centerPoints(data) {
      var center = [vm._center.x, vm._center.y].join(',');
      return data.points.map(function () {
        // All polygon's points move to the center.
        return center;
      }).join(' ');
    }

    function appendHelper(selection) {
      selection.append('polygon').attr('class', 'category').attr('points', centerPoints).style('stroke', function (d) {
        return d.color;
      }).style('fill', function (d) {
        return d.color;
      }).style('fill-opacity', 0.4).style('stroke-width', vm._ifStyleDefaults('1px')).call(updateHelper);
    }

    function removeHelper(selection) {
      selection.transition().duration(duration).attr('points', centerPoints).remove();
    }

    function updateHelper(selection) {
      selection.transition().duration(duration).attr('points', function (d) {
        return d.points.join(' ');
      });
    }

    function dataFunc(d) {
      return [d];
    }

    function keyFunc(d) {
      return d.polygon;
    }

    toUpdate = update.selectAll(selector).data(dataFunc, keyFunc);

    toUpdate.call(updateHelper);

    toUpdate.enter().call(appendHelper);

    toUpdate.exit().call(removeHelper);

    enter.selectAll(selector).data(dataFunc, keyFunc).enter().call(appendHelper);

    exit.selectAll(selector).call(removeHelper);
  };

  Radar.prototype.drawLegend = function () {
    var vm = this,
        cMap = vm._colorMap.list,
        svg = vm._chart._svg,
        at = vm._config.legend.at,
        side = 14,
        margin = 4,
        legend,
        newLegend;

    legend = svg.selectAll('g.legend-item').data(cMap, function (d) {
      return d.polygon;
    }).attr('opacity', function (d) {
      return vm._excludedPolygons.indexOf(d.polygon) > -1 ? .4 : 1;
    });

    newLegend = legend.enter().append('g').on('click', function (d) {
      vm._excludedPolygons = vm._toggleList(vm._excludedPolygons, [d.polygon]);
      vm.draw();
    }).attr('class', 'legend-item');

    newLegend.append('text').text(function (d) {
      return d.polygon;
    }).attr('x', at.x + side + margin).attr('y', function (d, i) {
      return (side + margin) * i + at.y + side;
    }).style('font-family', vm._ifStyleDefaults('sans-serif'));

    newLegend.append('rect').attr('fill', function (d) {
      return d.color;
    }).attr('width', side).attr('height', side).attr('x', at.x).attr('y', function (d, i) {
      return (side + margin) * i + at.y;
    });
  };

  /**
   * Return value if config styleDefaults is true, else null.
   * @param  {string} value The value to use as default
   * @return {string}       The value itself or null
   */
  Radar.prototype._ifStyleDefaults = function (value) {
    return this._config.styleDefaults ? value : null;
  };

  /**
   * Append items not present in base from items and pop those which are.
   * @param  {array} base   Array to append to remove from.
   * @param  {array} items  Items to be toogled (appended or removed).
   * @return {array}        A new array.
   */
  Radar.prototype._toggleList = function (base, items) {
    var newItems = items.filter(function (it) {
      return base.indexOf(it) == -1;
    });
    return base.filter(function (it) {
      return items.indexOf(it) == -1;
    }).concat(newItems);
  };

  Radar.prototype.xOf = function (rads, value) {
    var vm = this;
    return vm._center.x + value * Math.cos(rads);
  };

  Radar.prototype.yOf = function (rads, value) {
    var vm = this;
    return vm._center.y + value * Math.sin(rads);
  };

  Radar.prototype.minMax = function (data) {
    var vm = this;
    return data.reduce(function (minMax, row) {
      var val = parseInt(row[vm._config.valuesFrom]);
      if (minMax.length == 0) {
        return [val, val];
      }
      return [val < minMax[0] ? val : minMax[0], val > minMax[1] ? val : minMax[1]];
    }, []);
  };

  // Build the data with coords.
  Radar.prototype.dataForVisualization = function (data) {
    var vm = this,
        scale = vm._scale,
        axisKey = vm._config.axesFrom,
        valKey = vm._config.valuesFrom,
        polygKey = vm._config.polygonsFrom,
        axesHash = vm._axesData.hash;

    return data.map(function (row) {
      var axis = row[axisKey],
          rads = axesHash[axis].rads,
          polygon = row[polygKey],
          val = row[valKey],
          scVal = scale(val);
      return {
        xy: [vm.xOf(rads, scVal), vm.yOf(rads, scVal)],
        value: val,
        polygon: polygon,
        axis: axis,
        color: vm._colorMap.hash[polygon],
        rawData: row
      };
    });
  };

  Radar.prototype.filter = function (fun) {
    var vm = this;
    vm._filter = fun;
    return vm;
  };

  // DBOX internals.

  Radar.prototype.chart = function (chart) {
    var vm = this;
    vm._chart = chart;
    return vm;
  };

  Radar.prototype.data = function (data) {
    var vm = this;
    vm._data = data;
    return vm;
  };

  Radar.prototype.scales = function (scales) {
    var vm = this;
    vm._scales = scales;
    // We only need one scale.
    vm._scale = vm._scales.x;
    vm._scale.range([0, vm._radius]);
    return vm;
  };

  Radar.prototype.axes = function (axes) {
    var vm = this;
    // TODO Do nothing?
    return vm;
  };

  Radar.prototype.domains = function () {
    var vm = this;
    vm._calcDomains(vm._data);
    return vm;
  };

  Radar.prototype._calcDomains = function (data) {
    var vm = this;
    vm._minMax = vm.minMax(data);
    vm._scale.domain([0, vm._minMax[1]]);
    vm._ticks = vm._scale.ticks(vm._config.ticks);
    // Exclude 0 from ticks if it is the first element.
    // We don't need to have the 0 actually rendered.
    if (vm._ticks.length > 0 && vm._ticks[0] === 0) {
      vm._ticks = vm._ticks.slice(1);
    }
  };

  Radar.prototype.draw = function () {
    var vm = this,
        data = vm._data;

    // Build the color map previusly to filtering in order to keep the
    // association between colors and polygons even when some of them (the
    // polygons) have been filtered out.
    vm._colorMap = vm.buildColorMap(data);

    // Apply the filter function, if it's present.
    if (typeof vm._filter === 'function') {
      data = data.filter(vm._filter);
    }

    // Filter out excluded polygons from.
    if (vm._excludedPolygons.length > 0) {
      data = data.filter(function (it) {
        return vm._excludedPolygons.indexOf(it[vm._config.polygonsFrom]) == -1;
      });
    }

    vm._calcDomains(data);
    vm._axesData = vm.extractAxes(data);
    vm._viewData = vm.dataForVisualization(data);

    vm.drawTicks();
    vm.drawAxes();
    vm.drawAxesLabels();
    vm.drawTicksLabels();
    vm.drawPolygons();
    vm.drawLegend();
  };

  return new Radar(config);
};

/*
 * Simple Scatter chart
 */

var scatter = function (config) {

  function Scatter(config) {
    var vm = this;
    vm._config = config ? config : {};
    vm._data = [];
    vm._scales = {};
    vm._axes = {};
    vm._tip = d3.tip().attr('class', 'd3-tip');
  }

  //-------------------------------
  //User config functions
  Scatter.prototype.x = function (col) {
    var vm = this;
    vm._config.x = col;
    return vm;
  };

  Scatter.prototype.y = function (col) {
    var vm = this;
    vm._config.y = col;
    return vm;
  };

  Scatter.prototype.radius = function (radius) {
    var vm = this;
    vm._config.radius = radius;
    return vm;
  };

  Scatter.prototype.radiusRange = function (radiusRange) {
    var vm = this;
    vm._config.radiusRange = radiusRange;
    return vm;
  };

  Scatter.prototype.properties = function (properties) {
    var vm = this;
    vm._config.properties = properties;
    return vm;
  };

  Scatter.prototype.color = function (col) {
    var vm = this;
    vm._config.color = col;
    return vm;
  };

  Scatter.prototype.opacity = function (opacity) {
    var vm = this;
    vm._config.opacity = opacity;
    return vm;
  };

  Scatter.prototype.tip = function (tip) {
    var vm = this;
    vm._config.tip = tip;
    vm._tip.html(vm._config.tip);
    return vm;
  };

  Scatter.prototype.end = function () {
    var vm = this;
    return vm._chart;
  };

  //-------------------------------
  //Triggered by chart.js;
  Scatter.prototype.chart = function (chart) {
    var vm = this;
    vm._chart = chart;
    return vm;
  };

  Scatter.prototype.data = function (data) {
    var vm = this;
    vm._data = [];
    data.forEach(function (d, i) {
      var m = {};
      m.datum = d;
      m.x = vm._config.xAxis.scale == 'linear' ? +d[vm._config.x] : d[vm._config.x];
      m.y = vm._config.yAxis.scale == 'linear' ? +d[vm._config.y] : d[vm._config.y];
      m.color = vm._config.color.slice(0, 1) !== '#' ? d[vm._config.color] : vm._config.color;
      m.radius = vm._config.radius !== undefined ? isNaN(vm._config.radius) ? +d[vm._config.radius] : vm._config.radius : 5;

      if (vm._config.properties !== undefined && Array.isArray(vm._config.properties) && vm._config.properties.length > 0) {
        vm._config.properties.forEach(function (p) {
          m[p] = d[p];
        });
      }
      vm._data.push(m);
    });
    return vm;
  };

  Scatter.prototype.scales = function (s) {
    var vm = this;
    vm._scales = s;
    return vm;
  };

  Scatter.prototype.axes = function (a) {
    var vm = this;
    vm._axes = a;
    return vm;
  };

  Scatter.prototype.domains = function () {
    var vm = this;
    var xMinMax = d3.extent(vm._data, function (d) {
      return d.x;
    }),
        yMinMax = d3.extent(vm._data, function (d) {
      return d.y;
    }),
        radiusMinMax = d3.extent(vm._data, function (d) {
      return d.radius;
    });

    var arrOk = [0, 0];

    if (vm._config.fixTo45) {
      if (xMinMax[1] > yMinMax[1]) {
        arrOk[1] = xMinMax[1];
      } else {
        arrOk[1] = yMinMax[1];
      }

      if (xMinMax[0] < yMinMax[0]) {
        //yMinMax = xMinMax;
        arrOk[0] = xMinMax[0];
      } else {
        arrOk[0] = yMinMax[0];
      }

      vm._scales.x.domain(arrOk).nice();
      vm._scales.y.domain(arrOk).nice();
      vm._scales.radius = d3.scaleLinear().range(vm._config.radiusRange != undefined ? vm._config.radiusRange : [5, 15]).domain(radiusMinMax).nice();
    } else {
      vm._scales.x.domain(xMinMax); //.nice();
      vm._scales.y.domain(yMinMax); //.nice();
      if (vm._scales.x.nice) {
        vm._scales.x.nice();
      }
      if (vm._scales.y.nice) {
        vm._scales.y.nice();
      }
      vm._scales.radius = d3.scaleLinear().range(vm._config.radiusRange != undefined ? vm._config.radiusRange : [5, 15]).domain(radiusMinMax).nice();
      if (vm._config.xAxis && vm._config.xAxis.scale !== 'linear') {
        vm._scales.x.domain(vm._data.map(function (m) {
          return m.x;
        }));
      }
      if (vm._config.yAxis && vm._config.yAxis.scale !== 'linear') {
        vm._scales.y.domain(vm._data.map(function (m) {
          return m.y;
        }));
      }
    }

    if (vm._config.xAxis.scaleDomain && Array.isArray(vm._config.xAxis.scaleDomain)) {
      vm._scales.x.domain(vm._config.xAxis.scaleDomain);
    }
    if (vm._config.yAxis.scaleDomain && Array.isArray(vm._config.yAxis.scaleDomain)) {
      vm._scales.y.domain(vm._config.yAxis.scaleDomain);
    }
    return vm;
  };

  Scatter.prototype.draw = function () {
    var vm = this;

    //Call the tip
    vm._chart._svg.call(vm._tip);

    var circles = vm._chart._svg.selectAll(".dot").data(vm._data)
    //.data(vm._data, function(d){ return d.key})
    .enter().append("circle").attr("class", "dot").attr("class", function (d, i) {
      return d.properties !== undefined && d.properties.id !== undefined ? "scatter-" + d.properties.id : "scatter-" + i;
    }).attr("r", function (d) {
      return vm._scales.radius(d.radius);
    }).attr("cx", function (d) {
      if (vm._config.xAxis.scale == 'ordinal' || vm._config.xAxis.scale == 'band') return vm._scales.x(d.x) + Math.random() * (vm._scales.x.bandwidth() - d.size * 2);else return vm._scales.x(d.x);
    }).attr("cy", function (d) {
      if (vm._config.yAxis.scale == 'ordinal' || vm._config.yAxis.scale == 'band') return vm._scales.y(d.y) + Math.random() * (vm._scales.y.bandwidth() - d.size * 2);else return vm._scales.y(d.y);
    }).style("fill", function (d) {
      return d.color.slice(0, 1) !== '#' ? vm._scales.color(d.color) : d.color;
    }).style("opacity", vm._config.opacity !== undefined ? vm._config.opacity : 1).on('mouseover', function (d, i) {
      if (vm._config.mouseover) {
        vm._config.mouseover.call(vm, d, i);
      }
      vm._tip.show(d, d3.select(this).node());
    }).on('mouseout', function (d, i) {
      if (vm._config.mouseout) {
        vm._config.mouseout.call(this, d, i);
      }
      vm._tip.hide(d, d3.select(this).node());
    }).on("click", function (d, i) {
      if (vm._config.onclick) {
        vm._config.onclick.call(this, d, i);
      }
    });

    return vm;
  };

  Scatter.prototype.select = function (id) {
    var vm = this;
    return vm._chart._svg.select("circle.scatter-" + id);
  };

  Scatter.prototype.selectAll = function (id) {
    var vm = this;
    return vm._chart._svg.selectAll("circle");
  };

  return new Scatter(config);
};

/* Simple timeline example
 * Single and multiline timelines
 */

var timeline = function (config) {

  var parseDate = d3.timeParse('%Y-%m-%d');

  function Timeline(config) {
    var vm = this;
    vm._config = config ? config : {};
    vm._data = [];
    vm._scales = {};
    vm._axes = {};

    vm._line = d3.line().curve(d3.curveBasis).x(function (d) {
      return vm._scales.x(d.x);
    }).y(function (d) {
      return vm._scales.y(d.y);
    });

    vm._area = d3.area().curve(d3.curveBasis).x(function (d) {
      if (d.alreadyScaled && d.alreadyScaled === true) {
        return d.x;
      } else {
        return vm._scales.x(d.x);
      }
    }).y1(function (d) {
      if (d.alreadyScaled && d.alreadyScaled === true) {
        return d.y;
      } else {
        return vm._scales.y(d.y);
      }
    });
  }

  //-------------------------------
  //User config functions
  Timeline.prototype.x = function (col) {
    var vm = this;
    vm._config.x = col;
    return vm;
  };

  Timeline.prototype.y = function (col) {
    var vm = this;
    vm._config.y = col;
    return vm;
  };

  Timeline.prototype.series = function (arr) {
    var vm = this;
    vm._config.series = arr;
    return vm;
  };

  Timeline.prototype.color = function (col) {
    var vm = this;
    vm._config.color = col;
    return vm;
  };

  Timeline.prototype.end = function () {
    var vm = this;
    return vm._chart;
  };

  //-------------------------------
  //Triggered by the chart.js;
  Timeline.prototype.chart = function (chart) {
    var vm = this;
    vm._chart = chart;
    return vm;
  };

  Timeline.prototype.data = function (data) {
    var vm = this;

    vm._data = data.map(function (d) {
      d.x = parseDate(d[vm._config.x]);
      d.color = d[vm._config.color];
      delete d[vm._config.x];
      return d;
    });

    vm._lines = vm._config.y ? vm._config.y : vm._config.series;

    vm._lines = vm._lines.map(function (name) {
      return {
        name: name,
        values: data.map(function (d) {
          return { x: d.x, y: +d[name] };
        })
      };
    });

    return vm;
  };

  Timeline.prototype.scales = function (s) {
    var vm = this;
    vm._scales = s;
    return vm;
  };

  Timeline.prototype.axes = function (a) {
    var vm = this;
    vm._axes = a;
    return vm;
  };

  Timeline.prototype.domains = function () {
    var vm = this;
    vm._xMinMax = d3.extent(vm._data, function (d) {
      return d.x;
    });

    vm._yMinMax = [d3.min(vm._lines, function (c) {
      return d3.min(c.values, function (v) {
        return v.y;
      });
    }), d3.max(vm._lines, function (c) {
      return d3.max(c.values, function (v) {
        return v.y;
      });
    })];

    vm._scales.x.domain(vm._xMinMax);
    vm._scales.y.domain(vm._yMinMax);

    console.log(vm._scales.x.domain(), vm._chart._scales.x.domain());

    vm._chart._scales = vm._scales;

    return vm;
  };

  Timeline.prototype.draw = function () {
    var vm = this;

    var lines = vm._chart._svg.selectAll(".lines").data(vm._lines).enter().append("g").attr("class", "lines");

    var path = vm._chart._svg.selectAll(".lines").append("path").attr("class", "line").attr("d", function (d) {
      return vm._line(d.values);
    }).style("stroke", function (d) {
      if (d.name == "Airbus") {
        return "rgb(000,255,000)";
      } else {
        return "#000";
      }
    });

    var t = textures.lines().thicker();

    vm._chart._svg.call(t);

    vm._area.y0(vm._scales.y(vm._yMinMax[0]));

    var areas = vm._chart._svg.selectAll(".areas").data(vm._lines).enter().append("g").attr("class", "areas");

    var pathArea = vm._chart._svg.selectAll(".areas").append("path").attr("class", "area").attr("d", function (d) {
      return vm._area(d.values);
    }).attr("fill", t.url());

    return vm;
  };

  return new Timeline(config);
};

/* 
 * Simple SVG Treemap Chart
 */

var treemap = function (config) {
  function Treemap(config) {
    var vm = this;
    vm._config = config ? config : {};
    vm._config._padding = 3;
    vm._config._colorScale = d3.scaleOrdinal(d3.schemeCategory20c);
    vm._config._format = d3.format(",.1f");
    vm._config._labels = true;
    vm._config.tip = function (d) {
      return d.data.name + "\n" + vm._config._format(d.value);
    };
    vm._data = [];
    vm._scales = {};
    vm._axes = {};
    vm._tip = d3.tip().attr('class', 'd3-tip tip-treemap').direction('n').html(vm._config.tip);
  }

  //-------------------------------
  //User config functions
  Treemap.prototype.end = function () {
    var vm = this;
    return vm._chart;
  };

  Treemap.prototype.size = function (col) {
    var vm = this;
    vm._config._size = col;
    return vm;
  };

  Treemap.prototype.colorScale = function (arrayOfColors) {
    var vm = this;
    vm._config._colorScale = d3.scaleOrdinal(arrayOfColors);
    return vm;
  };

  Treemap.prototype.padding = function (padding) {
    var vm = this;
    vm._config._padding = padding;
    return vm;
  };

  Treemap.prototype.nestBy = function (keys) {
    var vm = this;
    if (Array.isArray(keys)) {
      if (keys.length == 0) throw "Error: nestBy() array is empty";
      vm._config._keys = keys;
    } else if (typeof keys === 'string' || keys instanceof String) {
      vm._config._keys = [keys];
    } else {
      if (keys == undefined || keys == null) throw "Error: nestBy() expects column names to deaggregate data";
      vm._config._keys = [keys.toString()];
      console.warning("nestBy() expected name of columns. Argument will be forced to string version .toString()");
    }
    vm._config._labelName = vm._config._keys[vm._config._keys.length - 1]; //label will be last key
    return vm;
  };

  Treemap.prototype.format = function (format) {
    var vm = this;
    if (typeof format == 'function' || format instanceof Function) vm._config._format = format;else vm._config._format = d3.format(format);
    return vm;
  };

  Treemap.prototype.labels = function (bool) {
    var vm = this;
    vm._config._labels = Boolean(bool);
    return vm;
  };

  Treemap.prototype.tip = function (tip) {
    var vm = this;
    vm._config.tip = tip;
    vm._tip.html(vm._config.tip);
    return vm;
  };

  //-------------------------------
  //Triggered by the chart.js;
  Treemap.prototype.chart = function (chart) {
    var vm = this;
    vm._chart = chart;
    return vm;
  };

  Treemap.prototype.scales = function () {
    var vm = this;
    return vm;
  };

  Treemap.prototype.axes = function () {
    var vm = this;
    return vm;
  };

  Treemap.prototype.domains = function () {
    var vm = this;
    return vm;
  };

  Treemap.prototype.isValidStructure = function (datum) {
    var vm = this;
    if ((typeof datum.name === 'string' || datum.name instanceof String) && Array.isArray(datum.children)) {
      var res = true;
      datum.children.forEach(function (child) {
        res = res && vm.isValidStructure(child);
      });
      return res;
    } else if ((typeof datum.name === 'string' || datum.name instanceof String) && Number(datum[vm._config._size]) == datum[vm._config._size]) {
      return true;
    } else {
      return false;
    }
  };

  Treemap.prototype.formatNestedData = function (data) {
    var vm = this;
    if (data.key) {
      data.name = data.key;
      delete data.key;
    } else {
      if (!Array.isArray(data.values)) {
        data.name = data[vm._config._labelName];
      }
    }
    if (Array.isArray(data.values)) {
      var children = [];
      data.values.forEach(function (v) {
        children.push(vm.formatNestedData(v));
      });
      data.children = children;
      delete data.values;
    }
    if (!data[vm._config._size] && data.value) {
      data[vm._config._size] = data.value;
    }
    return data;
  };

  function nestKey(nest, key, callback) {
    callback(null, nest.key(function (d) {
      return d[key];
    }));
  }

  Treemap.prototype.data = function (data) {
    var vm = this;
    // Validate structure like [{name: '', children: [{},{}]}]
    if (data) {
      if (Array.isArray(data) && data.length > 0) {
        if (!vm.isValidStructure(data[0])) {
          data.forEach(function (d) {
            d[vm._config._size] = +d[vm._config._size];
          });
          try {
            if (!vm._config._keys) throw "nestBy() in layer was not configured";
            var nested = d3.nest();
            var queue = d3.queue();
            for (var i = 0; i < vm._config._keys.length; i++) {
              queue.defer(nestKey, nested, vm._config._keys[i]);
            }queue.awaitAll(function (error, nested) {
              var nestedData = nested[0].rollup(function (leaves) {
                return d3.sum(leaves, function (d) {
                  return d[vm._config._size];
                });
              }).entries(data);
              var aux = {};
              aux.key = 'data';
              aux.values = _.cloneDeep(nestedData); // WARN: Lodash dependency
              data = vm.formatNestedData(aux);
              vm._data = data;
            });
          } catch (err) {
            console.error(err);
          }
        }
      } else {
        if (!vm.isValidStructure(data)) {
          try {
            if (!data.key) throw "Property 'key' not found";
            if (data[vm._config._size] !== Number(data[vm._config._size])) throw "Value used for treemap rect size is not a number";
            data = vm.formatNestedData(data);
            vm._data = data;
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
    return vm;
  };

  Treemap.prototype.draw = function () {
    var vm = this;
    vm._chart._svg.call(vm._tip);

    var treemap = d3.treemap().tile(d3.treemapResquarify).size([vm._chart._width, vm._chart._height]).round(true).paddingInner(vm._config._padding);

    var root = d3.hierarchy(vm._data).eachBefore(function (d) {
      d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name;
    }).sum(function (d) {
      return d[vm._config._size];
    }).sort(function (a, b) {
      return b.height - a.height || b.value - a.value;
    });

    treemap(root);

    var cell = vm._chart._svg.selectAll("g").data(root.leaves()).enter().append("g").attr("transform", function (d) {
      return "translate(" + d.x0 + "," + d.y0 + ")";
    });

    var rect = cell.append("rect").attr("id", function (d) {
      return d.data.id;
    }).attr("width", function (d) {
      return d.x1 - d.x0;
    }).attr("height", function (d) {
      return d.y1 - d.y0;
    }).attr("fill", function (d) {
      return vm._config._colorScale(d.data.id);
    });

    cell.append("clipPath").attr("id", function (d) {
      return "clip-" + d.data.id;
    }).append("use").attr("xlink:href", function (d) {
      return "#" + d.data.id;
    });

    if (vm._config._labels) {
      var text = cell.append("text").attr("clip-path", function (d) {
        return "url(#clip-" + d.data.id + ")";
      });
      text.append("tspan").attr('class', 'capitalize').attr("x", 8).attr("y", 25).text(function (d) {
        if (d.value > 2) {
          var arr = d.data.id.replace('data.', '').split('.');
          return arr.length > 1 ? arr.slice(arr.length - 2, arr.length).join(' / ') : arr[arr.length - 1].toString();
        } else return '';
      });
      text.append("tspan").attr('class', 'capitalize').attr("x", 8).attr("y", 45).text(function (d) {
        return d.value > 2 ? vm._config._format(d.value) : '';
      });
    }

    rect.on('mouseover', function (d) {
      /*if(vm._config.data.mouseover){
        vm._config.data.mouseover.call(vm, d,i);
      }*/
      vm._tip.show(d, d3.select(this).node());
    }).on('mouseout', function (d) {
      /*if(vm._config.data.mouseout){
        vm._config.data.mouseout.call(this, d,i);
      }*/
      vm._tip.hide(d, d3.select(this).node());
    });

    return vm;
  };
  return new Treemap(config);
};

/*
 * Dboxjs
 *
 * You can import other modules here, including external packages. When
 * bundling using rollup you can mark those modules as external and have them
 * excluded or, if they have a jsnext:main entry in their package.json (like
 * this package does), let rollup bundle them into your dist file.
 */

/* Core */

exports.chart = chart;
exports.bars = bars;
exports.heatmap = heatmap;
exports.radar = radar;
exports.scatter = scatter;
exports.timeline = timeline;
exports.treemap = treemap;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=dbox.js.map
