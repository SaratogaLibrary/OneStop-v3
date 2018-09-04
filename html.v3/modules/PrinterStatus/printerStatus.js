// Copyright(c)2017-2018 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-PrinterStatus',
[
  'ewOneStop-Dialogs',
  'ewOneStop-Preferences',
  'ewOneStop-Sessions',
  'ewOneStop-Utilities',
  'ewOneStop-Languages'
])

.factory('PrinterStatus',
[
  '$q',
  'DialogService',
  'PreferencesService',
  'SessionsService',
  'LanguagesService',
  'BooleanValue',
function($q, DialogService, PreferencesService, SessionsService, LanguagesService, BooleanValue) {
  'use strict';

  var getTranslationForOperation = function(operation) {
    if (operation === 'Checkout') {
      return LanguagesService.translate('COMMON_CHECK_OUT');
    } else if (operation === 'Checkin') {
      return LanguagesService.translate('COMMON_CHECK_IN');
    }
    return operation;
  };

  var showNoReceiptWarning = function(operation) {
    var translatedOperation = getTranslationForOperation(operation),
        warningMsg = LanguagesService.translate('PRINTER_STATUS_PRINTER_DOWN_CONTINUE', [ translatedOperation.toLowerCase() ]),
		    buttons = [
    			{ id: 'CONTINUE', text: LanguagesService.translate('PRINTER_STATUS_CONTINUE_BUTTON') },
    			{ id: 'CANCEL', text: LanguagesService.translate('PRINTER_STATUS_CANCEL_BUTTON') }
    		];
		return DialogService.showWarning(warningMsg, LanguagesService.translate('PRINTER_STATUS_PRINTER_DOWN_CONTINUE_HEADER'), buttons)
						.then(function(choice) {
							if (choice === buttons[0].id) {
								return $q.when('WARNING_SHOWN');
							}
							return $q.reject();
						});
  };

  var showNoReceiptError = function(operation) {
    var translatedOperation = getTranslationForOperation(operation),
        msg = LanguagesService.translate('PRINTER_STATUS_PRINTER_DOWN', [ translatedOperation ]),
        header = LanguagesService.translate('PRINTER_STATUS_PRINTER_DOWN_HEADER', [ translatedOperation ]);
		return DialogService.showError(msg, header)
						.then(function() {
							return $q.reject();
						});
	};

  var check = function(operation) {
    if (!BooleanValue(PreferencesService.get(operation + 'PrintReceipt'))) {
			return $q.when('NOT_CHECKED');
		}
    return SessionsService.refresh('status')
						.then(function(session) {
							if (session.isPrinterReady()) {
								return $q.when('PRINTER_OK');
							}

							if (BooleanValue(PreferencesService.get(operation + 'Allow' + operation + 'WhenPrinterDown'))) {
								if (!BooleanValue(PreferencesService.get('ReceiptPrinterShowStatus'))) {
									return $q.when('WARNING_DISABLED');
								}
								return showNoReceiptWarning(operation);
							}
							return showNoReceiptError(operation);
						})
            .catch(function(error) {
              return DialogService.showError(error.text, LanguagesService.translate('PRINTER_STATUS_FAILED_TO_GET_PRINTER_STATUS_HEADER'))
                      .then(function() {
                        return $q.when('REFRESH_FAILED');
                      });
            });
	};

  return {
    showNoReceiptWarning: showNoReceiptWarning,
    showNoReceiptError: showNoReceiptError,
    check: check
  };
}]);
