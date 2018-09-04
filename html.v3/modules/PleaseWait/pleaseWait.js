// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-PleaseWait',
[

])

.factory('PleaseWaitService',
[
  '$rootScope',
function($rootScope) {
  'use strict';

  var context = {
    waiting: false,
    message: ''
  };

  var setWaiting = function(waiting, message) {
    context.waiting = waiting;
    context.message = message;
    $rootScope.$broadcast('waiting.stateChange', context);
  };

  return {
    setWaiting: setWaiting
  };
}])

.controller('PleaseWaitController',
[
  '$scope',
  'PleaseWaitService',
function($scope) {
  'use strict';

  var init = function() {
    $scope.context = {
      waiting: false,
      message: ''
    };

    $scope.$on('waiting.stateChange', function(event, args) {
      $scope.context = args;
    });
  };
  init();
}]);
