(function() {
  'use strict';

  angular
    .module('dboxLibrary')
    .directive('navbar', navbar);

  /** @ngInject */
  function navbar() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/navbar/navbar.html',
      scope: {

      },
      controller: NavbarController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function NavbarController(moment, $window, $scope, $languageService) {
      var vm = this;
      var pageWidth = $window.screen.availWidth;
      vm.logo_color="logo-chi";
      vm.mobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || pageWidth < 620 && pageWidth > 0) ? true : false;  
      vm.data = $languageService.data;
      angular.element($window).bind("scroll", function() {
        if(this.pageYOffset >= 400){
          vm.applyStick = true;
          vm.logo_color = "logo-chi";
        }else{
          vm.applyStick = false;
          vm.logo_color = "logo-chi";
        }
      vm.applyStick = (this.pageYOffset >= 400) ? true : false;
      $scope.$apply();
      });
    }
  }

})();
