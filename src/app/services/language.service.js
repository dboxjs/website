(function(){
  'use strict';

  angular
    .module('dboxLibrary')
    .factory('$languageService', languageService);

  function languageService(){
    var service = {
      data : {
        language: 'spanish'
      }
    };
    return service;
  }
})();