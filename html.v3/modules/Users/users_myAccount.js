// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Users')

.factory('MyAccountService',
[
  '$http',
  '$q',
  'PreferencesService',
  'BooleanValue',
function($http, $q, PreferencesService, BooleanValue) {
  'use strict';

  var shouldShow = function(user) {
    var alwaysShow = BooleanValue(PreferencesService.get('CheckoutAlwaysShowMyAccountPage')),
        showOnlyWhenBlocked = BooleanValue(PreferencesService.get('MyAccountDisplayOnlyWhenPatronIsBlocked'));
    return (alwaysShow && !showOnlyWhenBlocked) || !user.hasChargePrivileges() || user.isCardReportedLost() || (user.owesFee() && !showOnlyWhenBlocked);
  };

  var print = function(language, mode, emailOptions) {
    var params = {
      action: 'printMyAccount',
      template: PreferencesService.get('WebServerDocumentRoot', '') + '/receiptTemplates/my_account_summary_' + language + '.htm',
      mode: mode,
      nextPage: 'schemas/error.json',
      errorPage: 'schemas/error.json'
    };

    if ((Number(mode) === 1) || (Number(mode) === 2)) {
      if (emailOptions.toAddress) {
        params.emailAddress = emailOptions.toAddress;
      }
      if (emailOptions.subject) {
        params.emailSubject = emailOptions.subject;
      }
      if (emailOptions.format) {
        params.emailFormat = emailOptions.format;
      }
    }

    return $http({
              method: 'GET',
              url: '/selfCheck',
              params: params
            })
            .then(function(response) {
              if (Number(response.data.code) === 0) {
                return $q.when(response.data);
              } else {
                return $q.reject(response.data);
              }
            }, function(error) {
              return $q.reject({ code: error.status, text: error.message || error.data });
            });
  };

  return {
    shouldShow: shouldShow,
    print: print
  };
}])

.controller('MyAccountController',
[
  '$scope',
  '$location',
  '$q',
  'UsersService',
  'SessionsService',
  'MyAccountService',
  'PrinterStatus',
  'PreferencesService',
  'LanguagesService',
  'ReceiptsService',
  'ItemsListDialog',
  'ButtonRowService',
  'ButtonRowButton',
  'DialogService',
  'StartService',
  'PageTimeoutService',
  'PleaseWaitService',
  'FinesService',
  'BooleanValue',
function( $scope,
          $location,
          $q,
          UsersService,
          SessionsService,
          MyAccountService,
          PrinterStatus,
          PreferencesService,
          LanguagesService,
          ReceiptsService,
          ItemsListDialog,
          ButtonRowService,
          ButtonRowButton,
          DialogService,
          StartService,
          PageTimeoutService,
          PleaseWaitService,
          FinesService,
          BooleanValue) {
  'use strict';

  $scope.showChargedItems = function() {
    ItemsListDialog.showChargedItems($scope.user.chargedItems, $scope.should.allowRenew);
  };

  $scope.showOverdueItems = function() {
    ItemsListDialog.showOverdueItems($scope.user.overdueItems, $scope.should.allowRenew);
  };

  $scope.showHoldItems = function() {
    ItemsListDialog.showHoldItems($scope.user.holdItems);
  };

  $scope.showFineItems = function() {
    ItemsListDialog.showFineItems($scope.user.fineItems);
  };

  $scope.viewOrPayFines = function() {
    if ($scope.should.allowFinesPay) {
      $scope.payFines();
    } else if ($scope.should.showFineItems) {
      $scope.showFineItems();
    }
  };

  $scope.payFines = function() {
    if ($scope.should.allowFinesPay) {
      PageTimeoutService.stopInactivityTimer();

      FinesService
      .payFines()
      .then(function(/*result*/) {
        /* Note: RTW - 2017-09-01 There is a problem with the way the OneStop responds to /selfCheck?action=payFines
                  The logged response appears to be valid XML, but the browser never gets the data
                  Even Chrome shows Failed to Load Response data
                  In 2.0, after fines were paid, the UI blindly reloaded the My Account page without trying to interpret the response
                  Until I can determine how to fix the response, I'm going to emulate the 2.0 behavior

        if (result.result === FinesService.PAYMENT_RESULT.SUCCESS) {
          UsersService
          .getUser($scope.user.id, $scope.user.pin)
          .then(function(user) {
            $scope.user = user;
          })
          .catch(function(error) {
            DialogService.showError(error.text);
          });
        } else if (result.result === FinesService.PAYMENT_RESULT.CANCELED) {
          DialogService.showError($scope.pageText.paymentRequestCanceled);
        } else {
          DialogService.showError($scope.pageText.paymentRequestFailed + ': ' + result.result);
        }
        */
      })
      .catch(function(/*error*/) {
        // DialogService.showError(error.text);
      })
      .finally(function() {
        startInactivityTimer();
        UsersService
        .getUser($scope.user.id, $scope.user.pin)
        .then(function(user) {
          $scope.user = user;
        })
        .catch(function(error) {
          DialogService.showError(error.text);
        });
      });
    }
  };

  $scope.startOver = function() {
    cleanUp();
    StartService.startOver();
  };

  $scope.goToCheckout = function() {
    var printerStatus = $location.search().printerStatus,
        promise;
    if ($scope.checkingOut) {
      $location.search('inProgress', '1');
      promise = $q.when();
    } else if ((printerStatus === 'WARNING_SHOWN') || (printerStatus === 'WARNING_DISABLED')) {
        promise = $q.when();
    } else {
      promise = PrinterStatus.check('Checkout');
    }

    promise.then(function() {
      cleanUp();
      $location.path('checkout');
    });
  };

  $scope.print = function() {
    var emailOptions = {},
        first = $q.defer();

    if ($scope.should.allowEmail && $scope.should.allowPrint) {
      ReceiptsService.receiptOptionsDialog
        .show(true, true, true, $scope.session.isPrinterReady())
        .then(function(choice) {
          var mode;
          if (choice === 'both'){
            mode = 3;
          } else if (choice === 'email') {
            mode = 2;
          } else if (choice === 'print') {
            mode = 1;
          }
          first.resolve(mode);
        });
    } else if ($scope.should.allowEmail) {
      first.resolve(2);
    } else if ($scope.should.allowPrint) {
      if ($scope.session && $scope.session.isPrinterReady()) {
        first.resolve(1);
      } else {
        DialogService.showError(LanguagesService.translate('MY_ACCOUNT_SUMMARY_PRINTER_NOT_AVAILABLE'), LanguagesService.translate('MY_ACCOUNT_SUMMARY_PRINTER_NOT_AVAILABLE_HEADER'));
      }
    }

    var second = $q.defer();
    first.promise.then(function(mode) {
      if ((mode === 2) || (mode === 3)) {
        ReceiptsService.emailAddressDialog
          .show(true, $scope.user.emailAddress)
          .then(function(emailAddress) {
            emailOptions = { toAddress: emailAddress, subject: LanguagesService.translate('MY_ACCOUNT_SUMMARY_EMAIL_SUBJECT'), format: PreferencesService.get('EmailReceiptsFormat') };
            second.resolve(mode);
          })
          .catch(function() {
            // do nothing; user canceled
          });
      } else {
        second.resolve(mode);
      }
    });

    second.promise.then(function(mode) {
      if (mode) {
        PleaseWaitService.setWaiting(true);
        MyAccountService.print(LanguagesService.getCurrentLanguageCode(), (mode - 1), emailOptions)
        .then(function(/* result */) {
          PleaseWaitService.setWaiting(false);
          var msg;
          switch(mode) {
            case 1: // print
              msg = LanguagesService.translate('MY_ACCOUNT_SUMMARY_PRINT_SUCCEEDED'); break;
            case 2: // email
              msg = LanguagesService.translate('MY_ACCOUNT_SUMMARY_EMAIL_SUCCEEDED'); break;
            case 3: // print and email
              msg = LanguagesService.translate('MY_ACCOUNT_SUMMARY_PRINT_AND_EMAIL_SUCCEEDED'); break;
          }
          DialogService.showMessage(msg);
        })
        .catch(function(error) {
          PleaseWaitService.setWaiting(false);
          DialogService.showError(error.text, LanguagesService.translate('MY_ACCOUNT_SUMMARY_FAILED'));
        });
      }
    });
  };

  var cleanUp = function() {
    if ($scope.checkingOut) {
      $location.search('startOver', null);
    }
    $location.search('printerStatus', null);
  };

  var startInactivityTimer = function() {
    var timeoutValue = Number(PreferencesService.get('PageTimeout'));
    if (!isNaN(timeoutValue) && (timeoutValue > 0)) {
      PageTimeoutService.startInactivityTimer(timeoutValue);
    }
  };

  var setPrintButtonText = function(button) {
    if ($scope.should.allowPrint && $scope.should.allowEmail) {
      button.text = $scope.pageText.printOrEmailButton;
    } else if ($scope.should.allowEmail) {
      button.text = $scope.pageText.emailButton;
    } else if ($scope.should.allowPrint) {
      button.text = $scope.pageText.printButton;
    }
  };

  var setButtonText = function() {
    ButtonRowService.buttonRow.buttons.forEach(function(button) {
      if (button.action === $scope.startOver) {
        button.text = $scope.pageText.doneButton;
      } else if (button.action === $scope.goToCheckout) {
        button.text = ($scope.checkingOut ? $scope.pageText.backButton : $scope.pageText.checkoutButton);
      } else if (button.action === $scope.goBack) {
        button.text = $scope.pageText.backButton;
      } else if (button.action === $scope.print) {
        setPrintButtonText(button);
      }
    });
  };

  var setPageText = function() {
    $scope.pageText = {
      header: LanguagesService.translate('MY_ACCOUNT_HEADER'),
      overview: LanguagesService.translate('MY_ACCOUNT_OVERVIEW'),
      name: LanguagesService.translate('MY_ACCOUNT_LABEL_FOR_NAME'),
      address: LanguagesService.translate('MY_ACCOUNT_LABEL_FOR_ADDRESS'),
      status: LanguagesService.translate('MY_ACCOUNT_LABEL_FOR_STATUS'),
      chargedItemsButton: LanguagesService.translate('MY_ACCOUNT_CHARGED_ITEMS_BUTTON'),
      overdueItemsButton: LanguagesService.translate('MY_ACCOUNT_OVERDUE_ITEMS_BUTTON'),
      holdItemsButton: LanguagesService.translate('MY_ACCOUNT_HOLD_ITEMS_BUTTON'),
      fineItemsButton: LanguagesService.translate('MY_ACCOUNT_FINE_ITEMS_BUTTON'),
      pressToView: LanguagesService.translate('MY_ACCOUNT_PRESS_TO_VIEW'),
      pressToViewOrRenew: LanguagesService.translate('MY_ACCOUNT_PRESS_TO_VIEW_OR_RENEW'),
      pressToPay: LanguagesService.translate('MY_ACCOUNT_PRESS_TO_PAY_FINES'),
      doneButton: LanguagesService.translate('MY_ACCOUNT_DONE_BUTTON'),
      checkoutButton: LanguagesService.translate('MY_ACCOUNT_CHECK_OUT_BUTTON'),
      backButton: LanguagesService.translate('MY_ACCOUNT_BACK_BUTTON'),
      printButton: LanguagesService.translate('MY_ACCOUNT_PRINT_BUTTON'),
      emailButton: LanguagesService.translate('MY_ACCOUNT_EMAIL_BUTTON'),
      printOrEmailButton: LanguagesService.translate('MY_ACCOUNT_PRINT_OR_EMAIL_BUTTON'),
      notSignedInError: LanguagesService.translate('MY_ACCOUNT_NOT_SIGNED_IN_ERROR'),
      blockedFromCheckingOutError: LanguagesService.translate('MY_ACCOUNT_BLOCKED_FROM_CHECKING_OUT_ERROR'),
      blockedFromRenewingError: LanguagesService.translate('MY_ACCOUNT_BLOCKED_FROM_RENEWING_ERROR'),
      blockedFromCheckingOutAndRenewingError: LanguagesService.translate('MY_ACCOUNT_BLOCKED_FROM_CHECKING_OUT_AND_RENEWING_ERROR'),
      lostCardError: LanguagesService.translate('MY_ACCOUNT_LOST_CARD_ERROR'),
      lostCardHeader: LanguagesService.translate('MY_ACCOUNT_LOST_CARD_HEADER'),
      paymentRequestCanceled: LanguagesService.translate('MY_ACCOUNT_PAYMENT_REQUEST_CANCELED'),
      paymentRequestFailed: LanguagesService.translate('MY_ACCOUNT_PAYMENT_REQUEST_FAILED')
    };
    setButtonText();
  };

  var init = function() {
    ButtonRowService.reset();
    setPageText();

    // TODO: Decide whether to refresh the user record
    $scope.user = UsersService.getCurrentUser();
    if (!$scope.user) {
      DialogService.showError($scope.pageText.notSignedInError)
      .then(function() {})
      .catch(function() {})
      .finally(function() {
        $scope.startOver();
      });
      // TODO: decide whether to automatically start over
      //ButtonRowService.addButton(new ButtonRowButton({ text: $scope.pageText.doneButton, action: $scope.startOver }));
    } else if ($scope.user.isCardReportedLost()) {
      // TODO: Decide whether this should show as a pop up or in a field on the page
      DialogService.showError($scope.pageText.lostCardError, $scope.pageText.lostCardHeader);
      ButtonRowService.addButton(new ButtonRowButton({ text: $scope.pageText.doneButton, action: $scope.startOver }));
    } else if (!$scope.user.hasChargePrivileges()) {
      var errMsg;
      if (!$scope.user.hasRenewalPrivileges()) {
        errMsg = $scope.pageText.blockedFromCheckingOutAndRenewingError;
      } else {
        errMsg = $scope.pageText.blockedFromCheckingOutError;
      }
      // TODO: Decide whether this should show as a pop up or in a field on the page
      DialogService.showError(errMsg);

      ButtonRowService.addButton(new ButtonRowButton({ text: $scope.pageText.doneButton, action: $scope.startOver }));
    } else {
      if (!$scope.user.hasRenewalPrivileges()) {
        DialogService.showError($scope.pageText.blockedFromRenewingError);
      }
      $scope.checkingOut = ($location.search().startOver === 'checkout');
//      if ($scope.checkingOut) {
//        ButtonRowService.addButton(new ButtonRowButton({ text: $scope.pageText.backButton, action: $scope.goToCheckout }));
//        ButtonRowService.addButton(new ButtonRowButton({ text: $scope.pageText.printButton, action: $scope.print, visible: false, enabled: false }));
//      } else {
        ButtonRowService.addButton(new ButtonRowButton({ text: $scope.pageText.doneButton, action: $scope.startOver }));
        ButtonRowService.addButton(new ButtonRowButton({ text: $scope.pageText.printButton, action: $scope.print, visible: false, enabled: false }));
        ButtonRowService.addButton(new ButtonRowButton({ text:$scope.pageText.checkoutButton, action: $scope.goToCheckout }));
//      }
    }


    $scope.currencySymbol = PreferencesService.get('CurrencySymbol');

    var canPrintSummary = PreferencesService.get('MyAccountAllowUserToPrintSummary');
    $scope.should = {
      showAddress: BooleanValue(PreferencesService.get('MyAccountShowUserAddress')),
      showIlsStatus: BooleanValue(PreferencesService.get('MyAccountShowIlsStatus')),
      showChargedItems: BooleanValue(PreferencesService.get('MyAccountAllowUserToViewChargedItems')),
      showOverdueItems: BooleanValue(PreferencesService.get('MyAccountAllowUserToViewOverdueItems')),
      showHoldItems: BooleanValue(PreferencesService.get('MyAccountAllowUserToViewHoldItems')),
      showFineItems: BooleanValue(PreferencesService.get('MyAccountAllowUserToViewFineItems')),
      allowRenew: ($scope.user && $scope.user.hasRenewalPrivileges()) && BooleanValue(PreferencesService.get('MyAccountAllowUserToRenewChargedItems')),
      allowFinesPay: BooleanValue(PreferencesService.get('PayFinesAllowed')),
      allowPrint:  ((canPrintSummary === '1') || (canPrintSummary === '3')),
      allowEmail:  ((canPrintSummary === '2') || (canPrintSummary === '3'))
    };

    if ($scope.should.allowPrint || $scope.should.allowEmail) {
      var buttons = ButtonRowService.buttonRow.buttons;
      if (buttons.length > 1) {
        buttons[1].visible = true;
        buttons[1].enabled = true;
        setPrintButtonText(buttons[1]);
      }
    }
    startInactivityTimer();

    SessionsService.refresh('status')
    .then(function(session) {
      $scope.session = session;
      if (!$scope.session.isLoggedIn()) {
        DialogService.showError($scope.pageText.notSignedInError)
        .then(function() {})
        .catch(function() {})
        .finally(function() {
          $scope.startOver();
        });
      }
    })
    .catch(function(/* error */) {
      /* do nothing */
    });

    $scope.$on('translations.received', function() {
      setPageText();
    });
  };
  init();
}]);
