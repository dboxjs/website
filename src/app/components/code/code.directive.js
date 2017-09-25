(function() {
  'use strict';

    angular
    .module('dboxLibrary')
    .directive('codeDirective', codeDirective);

    /** @ngInject */
    function codeDirective() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/code/code.html',
      scope: {

      },
      controller: codeDirectiveController,
      controllerAs: 'vm',
      bindToController: true
    };
    
    return directive;

    /** @ngInject */
    function codeDirectiveController(moment, $window, $scope, $languageService, $state) {
      var vm = this;
      
      var pageWidth = $window.screen.availWidth;
      vm.mobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || pageWidth < 620 && pageWidth > 0) ? true : false;
      vm.data = $languageService.data;
    }
  }

})();
