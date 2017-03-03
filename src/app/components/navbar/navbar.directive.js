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
    function NavbarController(moment, $window, $scope, $languageService,$state) {
      var vm = this;
      var pageWidth = $window.screen.availWidth;



      $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        console.log($state.is('home'), $state.$current  )
        vm.home = $state.is('home');
      });


      vm.logo_color="logo-chi_col";
      vm.mobile = ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || pageWidth < 620 && pageWidth > 0) ? true : false;
      vm.data = $languageService.data;
      angular.element($window).bind("scroll", function() {
        if(this.pageYOffset >= 400){
          vm.applyStick = true;
          vm.logo_color = "logo-chi_col";
          vm.home = false;
        }else{
          vm.applyStick = false;
          vm.logo_color = "logo-chi_col";
          vm.home = true;
        }
      vm.applyStick = (this.pageYOffset >= 400) ? true : false;
      $scope.$apply();
      });
    }
  }

})();
