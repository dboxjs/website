(function() {
  'use strict';

  angular
    .module('dboxLibrary')
    .directive('footerDirective', footerDirective);

  /** @ngInject */
  function footerDirective() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/footer/footer.html',
      scope: {

      },
      controller: FooterDirectiveController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function FooterDirectiveController(moment, $window, $scope, $languageService, $state) {
      var vm = this;
      
      var pageWidth = $window.screen.availWidth;
      vm.mobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || pageWidth < 620 && pageWidth > 0) ? true : false;
      vm.data = $languageService.data;
    }
  }

})();
