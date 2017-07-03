(function() {
  'use strict';

  angular
      .module('dbox')
      .controller('MapRoundedController', MapRoundedController);

  /** @ngInject */
  function MapRoundedController($scope) {
    var vm = this;

    var generalConfig = {};

    var mapConfig = {
        target: '#map-wrapper',
        identifierKey: 'ent_regis',
        zoom:{
          available: true,
          zoomRange: [1, 5]
        }
    };

    generalConfig.mapConfig = mapConfig;

    var circlesConfig = {
      minPadding: 8,
      radius: 4,
      style:{
        fill: "#C1D200",
        strokeColor: "white",
        strokeWidth: 2,
      }
    };

    generalConfig.circlesConfig = circlesConfig;

    var tipConfig = {
      classes: "rounded-map-tip-states",
      html: function(content){
        return content.ent_nom;
      }
    };

    generalConfig.tipConfig = tipConfig;

    var callbackConfig = {
      click: function(param){
        console.log("this is a click callback");
      },
      over: function(param){
        console.log("this is an over callback");
      },
      out: function(param){
        console.log("this is an out callback");
      }
    };

    generalConfig.callbackConfig = callbackConfig;

    var domain = [];

    var colorsRange = ["#88C2A8",'#78A79C','#4F677F',"#4F677F","191F50"];

    d3.csv('assets/data/mapa_todo.csv',drawMap);

    function drawMap(error,data){
      console.log(data);
      data.forEach(function(d){
        var numAux = Number(d.tasa).toFixed(2);
        domain.push( +numAux );
      });

      dbox.MexicoMapRounded(generalConfig).bindTo('#svgMapContainer').drawMap(data).colorStates(domain,colorsRange,fillCallback);
    }

    function returnTasa(d){
      return d.tasa;
    }

    function fillCallback(self,own,testScale){

      var found = null;

      for(var x = 0;x<self._data.length;x++){

        if("est_" + self._data[x].key === own.id){
          found = self._data[x].values[0];
          break;
        }
      }

      return (found) ? testScale(found.tasa) : "#000";
    }

  }
})();
