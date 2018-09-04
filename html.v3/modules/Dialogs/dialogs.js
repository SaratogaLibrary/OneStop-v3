// Copyright(c)2017-2018 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Dialogs',
[
  'ui.bootstrap',
  'ngSanitize',
  'ewOneStop-Languages'
])

.factory('DialogService',
[
  '$rootScope',
  '$uibModal',
  'LanguagesService',
function($rootScope, $uibModal, LanguagesService) {
  'use strict';

  var ERROR_IMAGE_PATH = '/assets/images/error.png',
      WARNING_IMAGE_PATH = '/assets/images/warning.png',
      PROMPT_IMAGE_PATH = '/assets/images/prompt.png',
      PROMPT_INFORMATION_PATH = '/assets/images/information.png';

  var show = function(text, pageHeader, image, buttons, timeout) {
    var layout = 'SIDE_BY_SIDE';
    if (typeof text === 'object') {
      pageHeader = text.pageHeader;
      layout = text.layout || layout;
      image = text.image;
      buttons = text.buttons;
      timeout = text.timeout;
      text = text.text;
    }

    var options = {
      animation: true,
      backdrop: 'static',
      controller: 'DialogController',
      keyboard: true,
      size: 'md',
      templateUrl: 'modules/Dialogs/dialog.tmpl.html',
      resolve: {
        context: {
          text: text,
          layout: layout,
          pageHeader: pageHeader,
          image: image
        }
      }
    };

    if (buttons) {
      options.resolve.context.buttons = buttons;
    }

    if (timeout) {
      options.resolve.context.timeout = timeout;
    }

    return $uibModal.open(options).result;
  };

  var showError = function(text, pageHeader, buttons) {
    if (pageHeader && (typeof pageHeader !== 'string')) {
      buttons = pageHeader;
      pageHeader = undefined;
    }
    return show(text, pageHeader || LanguagesService.translate('NOTICE_ERROR_HEADER'), ERROR_IMAGE_PATH, buttons);
  };

  var showWarning = function(text, pageHeader, buttons) {
    if (pageHeader && (typeof pageHeader !== 'string')) {
      buttons = pageHeader;
      pageHeader = undefined;
    }
    return show(text, pageHeader || LanguagesService.translate('NOTICE_WARNING_HEADER'), WARNING_IMAGE_PATH, buttons);
  };

  var showPrompt = function(text, pageHeader, buttons) {
    if (pageHeader && (typeof pageHeader !== 'string')) {
      buttons = pageHeader;
      pageHeader = undefined;
    }
    return show(text, pageHeader || '', PROMPT_IMAGE_PATH, buttons);
  };

  var showMessage = function(text, pageHeader, buttons) {
    if (pageHeader && (typeof pageHeader !== 'string')) {
      buttons = pageHeader;
      pageHeader = undefined;
    }
    return show(text, pageHeader || '', PROMPT_INFORMATION_PATH, buttons);
  };

  return {
    show: show,
    showError: showError,
    showWarning: showWarning,
    showPrompt: showPrompt,
    showMessage: showMessage
  };
}])

.controller('DialogController',
[
  '$scope',
  '$uibModalInstance',
  '$timeout',
  'LanguagesService',
  'context',
function($scope, $uibModalInstance, $timeout, LanguagesService, context) {
  'use strict';

  var timerId;

  $scope.close = function(id) {
    cancelTimer();
    $uibModalInstance.close(id);
  };

  var cancelTimer = function() {
    if (timerId) { $timeout.cancel(timerId); }
  };

  var init = function() {
    $scope.pageText = {
      okButton: LanguagesService.translate('NOTICE_OK_BUTTON')
    };

    $scope.pageHeader = context.pageHeader;
    if (typeof context.image === 'object') {
      $scope.image = context.image;
    } else {
      $scope.image = {
        path: context.image,
        height: '108',
        width: '108'
      };
    }
    $scope.text = context.text;
    $scope.layout = context.layout;
    $scope.buttons = context.buttons || [ { id: 'OK', text: $scope.pageText.okButton }];

    $scope.$on('inactivity.timeout', function() {
      cancelTimer();
      $uibModalInstance.dismiss('timeout');
    });

    if (context.timeout > 0) {
      timerId = $timeout(function() {
        timerId = null;
        $uibModalInstance.dismiss('timeout');
      }, context.timeout * 1000);
    }
  };
  init();
}]);
