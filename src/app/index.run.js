(function() {
  'use strict';

  angular
    .module('dboxLibrary')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
