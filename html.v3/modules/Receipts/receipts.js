// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Receipts',
[
  'ui.bootstrap',
  'ewOneStop-Sessions',
  'ewOneStop-Preferences',
  'ewOneStop-Utilities',
  'ewOneStop-Languages'
])

.constant('ReceiptConstants', {
  RECEIPT: {
    MODE: {
      PRINT: 0,
      EMAIL: 1,
      PRINT_AND_EMAIL: 2
    },
    FORMAT: {
      HTML: 'html',
      PLAIN: 'plain'
    }
  }
})

.factory('ReceiptsService',
[
  '$http',
  '$q',
  '$uibModal',
  'PreferencesService',
  'Session',
  'BooleanValue',
function($http, $q, $uibModal, PreferencesService, Session, BooleanValue) {
  'use strict';

  var uri = '/selfCheck';

  var performAction = function(params) {
    return $http({
      method: 'GET',
      url: uri,
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

  var provideReceipt = function(which, template, mode, printer, email) {
    var params = {
      action: 'print' + which + 'Receipt',
      template: template,
      receiptMode: mode,
      printer: printer,
      nextPage: 'schemas/statusSession.json',
      errorPage: 'schemas/error.json'
    };

    if (email) {
      params.emailAddress = email.address;
      params.emailFormat = email.format;
      if (email.subject) {
        params.emailSubject = email.subject;
      }
    }

    return performAction(params);
  };

  var provideCheckoutReceipt = function(template, mode, printer, email) {
    return provideReceipt('Checkout', template, mode, printer, email);
  };

  var provideCheckinReceipt = function(template, mode, printer, email) {
    return provideReceipt('Checkin', template, mode, printer, email);
  };

  var getTemplateName = function(which, language) {
    var templateName = PreferencesService.get('WebServerDocumentRoot', '') + '/receiptTemplates/';
    if (which === 'checkin') {
      templateName += 'checkin_receipt_';
    } else {
      templateName += 'receipt_';
      if (BooleanValue(PreferencesService.get('CheckoutShowExistingItemsOnReceipt'))) {
        templateName += 'detail_';
      }
    }
    templateName += language + '.htm';
    return templateName;
  };

  var emailAddressDialog = {
    show: function(showOnScreenKeyboard, emailAddress) {
            var options = {
              animation: true,
              backdrop: 'static',
              controller: 'EmailAddressDialogController',
              keyboard: true,
              size: 'md',
              templateUrl: 'modules/Receipts/emailAddressDialog.tmpl.html',
              windowClass: 'modal-with-key-pad',
              resolve: {
                context: {
                  showOnScreenKeyboard: showOnScreenKeyboard,
                  emailAddress: emailAddress
                }
              }
            };
            return $uibModal.open(options).result;
          }
  };

  var receiptOptionsDialog = {
    show: function(canPrint, canEmail, receiptRequired, isPrinterReady) {
            var options = {
              animation: true,
              backdrop: 'static',
              controller: 'ReceiptOptionsDialogController',
              keyboard: true,
              size: 'md',
              templateUrl: 'modules/Receipts/receiptOptionsDialog.tmpl.html',
              resolve: {
                context: {
                  canPrint: canPrint,
                  canEmail: canEmail,
                  receiptRequired: receiptRequired,
                  isPrinterReady: isPrinterReady
                }
              }
            };
            return $uibModal.open(options).result;
          }
  };

  return {
    getTemplateName: getTemplateName,
    provideCheckoutReceipt: provideCheckoutReceipt,
    provideCheckinReceipt: provideCheckinReceipt,
    receiptOptionsDialog: receiptOptionsDialog,
    emailAddressDialog: emailAddressDialog
  };
}])

.controller('ReceiptOptionsDialogController',
[
  '$scope',
  '$uibModalInstance',
  'LanguagesService',
  'context',
function($scope, $uibModalInstance, LanguagesService, context) {
  'use strict';

  $scope.close = function(selection) {
    $uibModalInstance.close(selection);
  };

  var setPageText = function() {
    $scope.pageText = {
      header: LanguagesService.translate('RECEIPT_OPTIONS_HEADER'),
      printerError: LanguagesService.translate('RECEIPT_OPTIONS_PRINTER_ERROR'),
      printButton: LanguagesService.translate('RECEIPT_OPTIONS_PRINT_BUTTON'),
      emailButton: LanguagesService.translate('RECEIPT_OPTIONS_EMAIL_BUTTON'),
      bothButton: LanguagesService.translate('RECEIPT_OPTIONS_BOTH_BUTTON'),
      noReceiptButton: LanguagesService.translate('RECEIPT_OPTIONS_NO_RECEIPT_BUTTON')
    };
  };
  
  var init = function() {
    setPageText();

    $scope.should = {
      allowPrint: context.canPrint,
      allowEmail: context.canEmail,
      requireReceipt: context.receiptRequired
    };

    $scope.is = {
      printerReady: context.isPrinterReady
    };

    $scope.$on('inactivity.timeout', function() {
      $uibModalInstance.dismiss('timeout');
    });
  };
  init();
}])

.controller('EmailAddressDialogController',
[
  '$scope',
  '$uibModalInstance',
  '$timeout',
  'PreferencesService',
  'LanguagesService',
  'context',
function($scope, $uibModalInstance, $timeout, PreferencesService, LanguagesService, context) {
  'use strict';

  var EMAIL_ADDRESS_FIELD = 'email-address-field';

  $scope.canAccept = function() {
    var value = $scope.email.address;
    return ((value !== null) && (value !== undefined) && (value.length > 0));
  };

  $scope.emailAddressField = {
    lostFocus: function(/*$event*/) {
      angular.element('#' + EMAIL_ADDRESS_FIELD).focus();
    },
    keydown: function($event) {
      if (($event.keyCode === 27) || ($event.which === 27)) {
        $scope.cancel();
      }
    }
  };

  $scope.clear = function() {
    $scope.email.address = '';
  };

  $scope.accept = function() {
    $uibModalInstance.close($scope.email.address);
  };

  $scope.cancel = function(reason) {
    $uibModalInstance.dismiss(reason || 'cancel');
  };

  var setPageText = function() {
    $scope.pageText = {
      header: LanguagesService.translate('EMAIL_ADDRESS_HEADER'),
      instructions: LanguagesService.translate('EMAIL_ADDRESS_INSTRUCTIONS'),
      placeholder: LanguagesService.translate('EMAIL_ADDRESS_PLACEHOLDER'),
      clearButton: LanguagesService.translate('EMAIL_ADDRESS_CLEAR_BUTTON'),
      okButton: LanguagesService.translate('EMAIL_ADDRESS_OK_BUTTON'),
      cancelButton: LanguagesService.translate('EMAIL_ADDRESS_CANCEL_BUTTON')
    };
  };

  var init = function() {
    setPageText();

    $scope.email = {
      address: context.emailAddress
    };

    var keypadStyle = PreferencesService.get('AlphanumericKeypadStyle', '1');
    $scope.keyboard = {
      layout: (keypadStyle === '2') ? 'EMAIL_QWERTY' : 'EMAIL_ALPHA',
      visible: context.showOnScreenKeyboard,
      inputField: EMAIL_ADDRESS_FIELD,
      lowerCase: true,
      showHideButton: false
    };

    $scope.context = context;

    $scope.$on('inactivity.timeout', function() {
      $scope.cancel('timeout');
    });
  };
  init();
}]);
