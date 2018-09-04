// Copyright(c)2017-2018 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-StaffFunctions',
[
  'ui.bootstrap',
  'ewOneStop-Sessions',
  'ewOneStop-Dialogs',
  'ewOneStop-Preferences',
  'ewOneStop-Utilities',
  'ewOneStop-Languages'
])

.factory('StaffFunctionsService',
[
  '$http',
  '$q',
  '$uibModal',
  'Session',
function($http, $q, $uibModal, Session) {
  'use strict';

  var URI = '/selfCheck';

  var performAction = function(params) {
    return $http({
              method: 'GET',
              url: URI,
              params: params
            })
            .then(function(response) {
              if (response.data.code) {
                // This is an error response ( { code: [error code], text: '[error text]' } )
                return $q.reject(response.data);
              }
              return $q.when(Session.create(response.data));
            }, function(error) {
              return $q.reject({ code: error.status, text: error.message || error.data });
            });
  };

  var validateStaffPassword = function(password) {
    var params = {
      action: 'validateStaffPassword',
      errorPage: 'schemas/error.json',
      nextPage: 'schemas/statusSession.json',
      password: password
    };
    return performAction(params);
  };

  var minimizeOneStop = function() {
    var params = {
      action: 'minimizeOneStop',
      errorPage: 'schemas/error.json',
      nextPage: 'schemas/statusSession.json'
    };
    return performAction(params);
  };

  var staffPasswordDialog = {
    show: function(showOnScreenKeyboard) {
            var options = {
              animation: true,
              backdrop: 'static',
              controller: 'StaffPasswordDialogController',
              keyboard: true,
              size: 'md',
              templateUrl: 'modules/StaffFunctions/staffPasswordDialog.tmpl.html',
              windowClass: 'modal-with-key-pad',
              resolve: {
                context: {
                  showOnScreenKeyboard: showOnScreenKeyboard
                }
              }
            };
            return $uibModal.open(options).result;
          }
  };

  return {
    staffPasswordDialog: staffPasswordDialog,
    validateStaffPassword: validateStaffPassword,
    minimizeOneStop: minimizeOneStop
  };
}])

.controller('StaffFunctionsController',
[
  '$scope',
  '$location',
  'StaffFunctionsService',
  'PreferencesService',
  'BooleanValue',
function($scope, $location, StaffFunctionsService, PreferencesService, BooleanValue) {
  'use strict';

  $scope.showStaffMenu = function() {
    if ($scope.should.allowStaffFunctions) {
      StaffFunctionsService.staffPasswordDialog.show(true)
      .then(function() {
        $location.path('staffMenu');
      })
      .catch(function() {
        // Do nothing
      });
    }
  };

  var init = function() {
    $scope.should = {
      allowStaffFunctions: BooleanValue(PreferencesService.get('MenuShowStaffFunctions'))
    };
  };
  init();
}])

.controller('StaffMenuController',
[
  '$scope',
  '$location',
  'StaffFunctionsService',
  'LanguagesService',
  'PageLayoutService',
  'DialogService',
  'StartService',
function($scope, $location, StaffFunctionsService, LanguagesService, PageLayoutService, DialogService, StartService) {
  'use strict';

  $scope.minimizeOneStop = function() {
    StaffFunctionsService.minimizeOneStop()
    .then(function() {

    })
    .catch(function(error) {
      DialogService.showError(error.text, $scope.pageText.minimizeFailedHeader);
    });
  };

  $scope.managePendingAlerts = function() {
    $location.path('pendingAlerts');
  };

  $scope.viewCirculationStatistics = function() {
    $location.path('viewStatistics');
  };

  $scope.exitStaffMenu = function() {
    $scope.$emit('resumeFocusLock');
    StartService.startOver();
  };

  var setPageText = function() {
    $scope.pageText = {
      minimizeOneStopButton: LanguagesService.translate('STAFF_FUNCTIONS_MINIMIZE_ONE_STOP_BUTTON'),
      managePendingAlertsButton: LanguagesService.translate('STAFF_FUNCTIONS_MANAGE_PENDING_ALERTS_BUTTON'),
      viewStatisticsButton: LanguagesService.translate('STAFF_FUNCTIONS_VIEW_STATSITICS_BUTTON'),
      exitStaffMenuButton: LanguagesService.translate('STAFF_FUNCTIONS_EXIT_STAFF_MENU_BUTTON'),
      minimizeFailedHeader: LanguagesService.translate('STAFF_FUNCTIONS_MINIMIZE_FAILED_HEADER')
    };
  };

  $scope.setNumButtons = function() {
    $scope.numButtons = 4;
  };

  $scope.setMenuWrapperClass = function() {
    $scope.menuWrapperClass = PageLayoutService.isLandscape() ? 'four-buttons-landscape' : 'four-buttons-portrait';
    /*
    if (PageLayoutService.isLandscape()) {
      switch($scope.numButtons) {
        case 8:
          $scope.menuWrapperClass = 'eight-buttons-landscape';
          break;

        case 7:
          $scope.menuWrapperClass = 'seven-buttons-landscape';
          break;

        case 6:
          $scope.menuWrapperClass = 'six-buttons-landscape';
          break;

        case 5:
          $scope.menuWrapperClass = 'five-buttons-landscape';

          break;
        case 4:
          $scope.menuWrapperClass = 'four-buttons-landscape';
          break;

        case 3:
          $scope.menuWrapperClass = 'three-buttons-landscape';
          break;

        case 2:
          $scope.menuWrapperClass = 'two-buttons-landscape';
          break;

        case 1:
          $scope.menuWrapperClass = 'one-button-landscape';
          break;
      }
    } else {
      switch($scope.numButtons) {
        case 8:
          $scope.menuWrapperClass = 'eight-buttons-portrait';
          break;
        case 7:
          $scope.menuWrapperClass = 'seven-buttons-portrait';
          break;
        case 6:
          $scope.menuWrapperClass = 'six-buttons-portrait';
          break;
        case 5:
          $scope.menuWrapperClass = 'five-buttons-portrait';
          break;
        case 4:
          $scope.menuWrapperClass = 'four-buttons-portrait';
          break;
        case 3:
          $scope.menuWrapperClass = 'three-buttons-portrait';
          break;
        case 2:
          $scope.menuWrapperClass = 'two-buttons-portrait';
          break;
        case 1:
          $scope.menuWrapperClass = 'one-button-portrait';
          break;
      }
    }
    */
  };

  var init = function() {
    setPageText();
    $scope.setNumButtons();
    $scope.setMenuWrapperClass();

    $scope.$on('translations.received', function() {
      setPageText();
    });
  };
  init();
}])

.controller('StaffPasswordDialogController',
[
  '$scope',
  '$q',
  '$timeout',
  '$uibModalInstance',
  'StaffFunctionsService',
  'PreferencesService',
  'LanguagesService',
  'InputField',
  'context',
function($scope, $q, $timeout, $uibModalInstance, StaffFunctionsService, PreferencesService, LanguagesService, InputField, context) {
  'use strict';

  var PASSWORD_FIELD = 'staff-password-field';

  $scope.canAccept = function() {
    return !$scope.submitted && !(!$scope.context.password) && ($scope.context.password.length > 0);
  };

  $scope.accept = function() {
    $scope.submitted = true;
    $scope.context.error = '';

    var promise,
        staffUserId = PreferencesService.get('StaffUserId');
    if (staffUserId && ($scope.context.password === staffUserId)) {
      promise = $q.when();
    } else {
      promise = StaffFunctionsService.validateStaffPassword($scope.context.password);
    }

    promise.then(function() {
      $scope.$emit('resumeFocusLock');
      $uibModalInstance.close();
    })
    .catch(function(/*error*/) {
      $scope.context.error = $scope.pageText.passwordError;
      $scope.submitted = false;
    });
  };

  $scope.cancel = function(reason) {
    $uibModalInstance.dismiss(reason || 'cancel');
    $timeout(function() { $scope.$emit('resumeFocusLock'); }, 0);
  };

  $scope.clear = function() {
    $scope.context.password = '';
    $timeout(function() { $scope.staffPasswordField.focus(); }, 0);
  };

  var setPageText = function() {
    $scope.pageText = {
      header: LanguagesService.translate('STAFF_FUNCTIONS_ENTER_PASSWORD_HEADER'),
      instructions: LanguagesService.translate('STAFF_FUNCTIONS_ENTER_PASSWORD_INSTRUCTIONS'),
      passwordError: LanguagesService.translate('STAFF_FUNCTIONS_ENTER_PASSWORD_ERROR'),
      clearButton: LanguagesService.translate('STAFF_FUNCTIONS_ENTER_PASSWORD_CLEAR_BUTTON'),
      submitButton: LanguagesService.translate('STAFF_FUNCTIONS_ENTER_PASSWORD_SUBMIT_BUTTON'),
      cancelButton: LanguagesService.translate('STAFF_FUNCTIONS_ENTER_PASSWORD_CANCEL_BUTTON')
    };
  };

  var init = function() {
    setPageText();

    $scope.$emit('suspendFocusLock');
    $scope.context = {
      password: '',
      error: ''
    };
    $scope.submitted = false;

    $scope.keyboard = {
      layout: 'QWERTY',
      visible: context.showOnScreenKeyboard,
      inputField: PASSWORD_FIELD,
      lowerCase: true,
      showHideButton: false
    };

    $scope.staffPasswordField = new InputField(PASSWORD_FIELD, $scope.canAccept, $scope.accept);

    $scope.$on('inactivity.timeout', function() {
      $scope.cancel('timeout');
    });
  };
  init();
}]);
