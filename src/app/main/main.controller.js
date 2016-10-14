(function() {
  'use strict';

  angular
    .module('dboxLibrary')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($timeout, toastr, $window, $languageService) {
    var vm = this;

    var pageWidth = $window.screen.availWidth;
    vm.mobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || pageWidth < 620 && pageWidth > 0) ? true : false;
    vm.data = $languageService.data;
    //vm.data.language cambia a 'english' o 'spanish' segun se seleccione en el navbar
  }
})();
