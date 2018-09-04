// Copyright(c)2017-2018 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Checkin',
[
  'ewOneStop-Utilities',
  'ewOneStop-Sessions',
  'ewOneStop-Start',
  'ewOneStop-PageTimeout',
  'ewOneStop-Preferences',
  'ewOneStop-Dialogs',
  'ewOneStop-ButtonRow',
  'ewOneStop-ProcessedItems',
  'ewOneStop-Languages'
])
.factory('CheckinResult',
[
  'ObjectProperty',
  'BooleanValue',
function(ObjectProperty, BooleanValue) {
  'use strict';

  var CheckinResult = function(data) {
    this.ok = ObjectProperty(data, 'ok', 'No');
    this.id = ObjectProperty(data, 'id', '');
    this.title = ObjectProperty(data, 'title', '');
    this.mediaType = ObjectProperty(data, 'mediaType', '');
    this.destinationLocation = ObjectProperty(data, 'destinationLocation', '');
    this.permanentLocation = ObjectProperty(data, 'permanentLocation', '');
    this.properties = ObjectProperty(data, 'properties', '');
    this.screenMessage = ObjectProperty(data, 'screenMessage', '');
    this.printLine = ObjectProperty(data, 'printLine', '');
  };

  CheckinResult.prototype.isOk = function() { return BooleanValue(this.ok); };

  CheckinResult.create = function(data) {
    return new CheckinResult(data);
  };

  return CheckinResult;
}])

.factory('CheckinService',
[
  '$http',
  '$q',
  'CheckinResult',
function($http, $q, CheckinResult) {
  'use strict';

  var checkin = function(itemId) {
    return $http({
              method: 'GET',
              url: '/selfCheck',
              params: {
                action: 'checkin',
                itemId: itemId,
                nextPage: 'schemas/checkinResult.json',
                errorPage: 'schemas/error.json'
              }
    })
    .then(function(response) {
      if (response.data.code) {
        return $q.reject(response.data);
      }
      return $q.when(CheckinResult.create(response.data));
    }, function(error) {
      return $q.reject({ code: error.status, text: error.message || error.data });
    });
  };

  return {
    checkin: checkin
  };
}])

.controller('CheckinController',
[
  '$scope',
  '$q',
  '$location',
  '$interval',
  '$timeout',
  'LanguagesService',
  'SessionsService',
  'CheckinService',
  'ProcessedItems',
  'PreferencesService',
  'DialogService',
  'StartService',
  'PageTimeoutService',
  'PleaseWaitService',
  'ButtonRowService',
  'ButtonRowButton',
  'ReceiptsService',
  'ReceiptConstants',
  'BooleanValue',
  'InputField',
  'ProcessedItemsTable',
  'ProcessedItemsColumn',
  'ElementFinder',
function( $scope,
          $q,
          $location,
          $interval,
          $timeout,
          LanguagesService,
          SessionsService,
          CheckinService,
          ProcessedItems,
          PreferencesService,
          DialogService,
          StartService,
          PageTimeoutService,
          PleaseWaitService,
          ButtonRowService,
          ButtonRowButton,
          ReceiptsService,
          ReceiptConstants,
          BooleanValue,
          InputField,
          ProcessedItemsTable,
          ProcessedItemsColumn,
          ElementFinder) {
  'use strict';

  var RFID_POLLING_INTERVAL = 500,
      SCROLL_AMOUNT = 20;

  $scope.showError = function(errMsg) {
    $scope.itemIdField.lockFocus = false;
    DialogService.showError(errMsg)
    .then(function() {})
    .catch(function() {})
    .finally(function() {
      $scope.itemIdField.lockFocus = true;
      $scope.itemIdField.focus();
    });
  };

  var canCheckin = function() {
    return !(!$scope.item.id);
  };

  $scope.checkin = function() {
    if (canCheckin()) {
      var itemId = $scope.item.id;
      // Cancel any input field updates that have not yet been processed
			if ($scope.itemIdForm && $scope.itemIdForm.$rollbackViewValue) {
				$scope.itemIdForm.$rollbackViewValue();
			}
      $scope.item.id = '';

      CheckinService.checkin(itemId)
      .then(function(/*checkinResult*/) {
      })
      .catch(function(error) {
        if (BooleanValue(PreferencesService.get('CheckinDisplayFailureNotificationsForBarcodeCheckIn'))) {
          var errMsg = $scope.pageText.itemWasNotCheckedIn; //'The following item was not successfully checked in:';
          errMsg += '<br/><br/>' + itemId + ' (' + error.text + ')<br/>';
          errMsg += $scope.pageText.continueThenSeeStaff; // 'Please continue to check in any other items that you have.  Once you are done, please take this item to the circulation desk for assistance.';
          $scope.showError(errMsg, $scope.pageText.checkInFailedHeader);
        }
      })
      .finally(function() {
        $scope.refreshSession();
      });
    }
  };

  $scope.refreshSession = function() {
    SessionsService.refresh('checkin')
    .then(function(session) {
      var priorItemCount = $scope.processedItems.length;
      $scope.session = session;
      $scope.processedItems = ProcessedItems.mergeCheckins($scope.processedItems, session);
      if ($scope.processedItems.length > 0) {
        if ($scope.processedItems.length > priorItemCount) {
          PageTimeoutService.resetInactivityTimer();
        }

        if (canPrintReceipt() || canEmailReceipt()) {
          ButtonRowService.buttonRow.buttons[1].visible = true;
          ButtonRowService.buttonRow.buttons[1].enabled = true;
        }
      }
    })
    .catch(function(error) {
      /* istanbul ignore next */
      console.error('Failed to update the session: ' + error);
    });
  };

  var doReceipt = function(mode, emailOptions) {
    PleaseWaitService.setWaiting(true);
    var templateName = ReceiptsService.getTemplateName('checkin', $scope.session.currentLanguageCode);
    var printer = PreferencesService.get('ReceiptPrinterName');
    ReceiptsService
    .provideCheckinReceipt(templateName, mode, printer, emailOptions)
    .then($scope.leavePage)
    .catch(function(error) {
      PleaseWaitService.setWaiting(false);
      $scope.showError(error.text, $scope.pageText.receiptFailedHeader);
    });
  };

  var doEmailReceipt = function(mode) {
    getEmailOptions()
    .then(function(emailOptions) {
      doReceipt(mode, emailOptions);
    })
    .catch(function(reason) {
      if (reason !== 'timeout') {
        $timeout($scope.showReceiptOptions, 0);
      }
    });
  };

  var getEmailOptions = function() {
    $scope.showItemIdField = false;
    return ReceiptsService
            .emailAddressDialog
            .show(true, '')
            .then(function(emailAddress) {
              var emailOptions = {
                address: emailAddress,
                subject: $scope.pageText.receiptSubject,
                format: PreferencesService.get('EmailReceiptsFormat') || ReceiptConstants.RECEIPT.FORMAT.HTML
              };
              return $q.when(emailOptions);
            });
  };

  $scope.printReceipt = function() {
    doReceipt(ReceiptConstants.RECEIPT.MODE.PRINT);
  };

  $scope.emailReceipt = function() {
    doEmailReceipt(ReceiptConstants.RECEIPT.MODE.EMAIL);
  };

  $scope.printAndEmailReceipt = function() {
    doEmailReceipt(ReceiptConstants.RECEIPT.MODE.PRINT_AND_EMAIL);
  };

  $scope.noReceipt = function() {
    $scope.leavePage();
  };

  $scope.showReceiptOptions = function() {
    ReceiptsService.receiptOptionsDialog
    .show(canPrintReceipt(), canEmailReceipt(), mustPrintReceipt(), $scope.session.isPrinterReady())
    .then(function(selection) {
            switch(selection) {
              case 'print':
                $scope.printReceipt();
                break;

              case 'email':
                $scope.emailReceipt();
                break;

              case 'both':
                $scope.printAndEmailReceipt();
                break;

              case 'none':
                $scope.noReceipt();
                break;
            }
    });
  };

  $scope.finishWithReceipt = function() {
    disableRfid()
    .then(function() {
      if (canPrintReceipt() || canEmailReceipt()) {
        if (!canEmailReceipt() && mustPrintReceipt() && $scope.session.isPrinterReady()) {
          doReceipt(ReceiptConstants.RECEIPT.MODE.PRINT);
        } else {
          $scope.showReceiptOptions();
        }
      }
      else {
        $scope.leavePage();
      }
    });
  };

  $scope.finish = function() {
    disableRfid()
    .then(function() {
      if ((canPrintReceipt() || canEmailReceipt()) && $scope.processedItems.length && mustPrintReceipt() && $scope.session.isPrinterReady()) {
        if (!canEmailReceipt() /*&& mustPrintReceipt() && $scope.session.isPrinterReady()*/) {
          doReceipt(ReceiptConstants.RECEIPT.MODE.PRINT);
        } else {
          $scope.showReceiptOptions();
        }
      } else {
        $scope.leavePage();
      }
    });
  };

  var scroll = function(amount) {
    var element = ElementFinder.find('#scrollable-table-body')[0];
    element.scrollTop = element.scrollTop + amount;
  };

  $scope.scrollUp = function() {
    scroll(-SCROLL_AMOUNT);
  };

  $scope.scrollDown = function() {
    scroll(SCROLL_AMOUNT);
  };

  $scope.scrollButtonsVisible = function() {
    var element = ElementFinder.find('#scrollable-table-body')[0];
    return element.clientHeight < element.scrollHeight;
  };

  var disableRfid = function() {
    if ($scope.useRfid) {
      return SessionsService.disableRfid('checkin')
              .then(function() {
                if (rfidInterval) {
                  $interval.cancel(rfidInterval);
                }
                return $q.when();
              });
    } else {
        return $q.when();
    }
  };

  $scope.leavePage = function() {
    disableRfid()
    .then(StartService.startOver);
  };

  var canPrintReceipt = function() {
    return BooleanValue(PreferencesService.get('CheckinPrintReceipt'));
  };

  var mustPrintReceipt = function() {
    return PreferencesService.get('CheckinPrintReceipt') === '1';
  };

  var canEmailReceipt = function() {
    return BooleanValue(PreferencesService.get('CheckinSendEmailReceipt'));
  };

  var setInstructions = function() {
    $scope.animationPath = '/assets/animations/';
    var isX11 = (PreferencesService.get('HardwareModel').substr(0, 3) === 'X11');
    if ($scope.useRfid) {
      $scope.instructions = $scope.pageText.instructionsForRfid;
      $scope.animationPath += isX11 ? 'X11-RFID-Books.gif' : 'ProLine-RFID-Books.gif';
    } else {
      $scope.instructions = $scope.pageText.instructionsForBarcode;
      $scope.animationPath += isX11 ? 'X11-Barcode-Book-Scan.gif' : 'ProLine-Barcode-Book-Scan.gif';
    }
  };

  var createProcessedItemsTable = function() {
    var columns = [
      new ProcessedItemsColumn($scope.pageText.titleColumnHeader, Number(PreferencesService.get('CheckinColumnTitle') || 1), 'title'),
      new ProcessedItemsColumn($scope.pageText.itemIdColumnHeader, Number(PreferencesService.get('CheckinColumnItemId') || 2), 'id'),
      new ProcessedItemsColumn($scope.pageText.statusColumnHeader, Number(PreferencesService.get('CheckinColumnStatus') || 3), 'status'),
      new ProcessedItemsColumn($scope.pageText.destinationLocationColumnHeader, Number(PreferencesService.get('CheckinColumnDestinationLocation') || -1), 'destinationLocation')
    ];
    $scope.processedItemsTable = new ProcessedItemsTable(columns);
  };

  var rfidInterval;
  var startSession = function() {
    $scope.session = {};
    SessionsService.startCheckinSession()
    .then(function(session) {
      $scope.session = session;
      if ($scope.useRfid) {
        console.log('Enabling RFID');
        SessionsService.enableRfidCheckin()
        .then(function() {
          console.log('RFID enabled');
          rfidInterval = $interval($scope.refreshSession, RFID_POLLING_INTERVAL);
        })
        .catch(function(error) {
          console.error('Failed to enable RFID');
          $scope.showError(error.text);
        });
      }
    })
    .catch(function(error) {
      $scope.showError(error.text);
    });
  };

  var startInactivityTimer = function() {
    var timeoutValue = Number(PreferencesService.get('PageLongTimeout'));
    if (!isNaN(timeoutValue) && (timeoutValue > 0)) {
      PageTimeoutService.startInactivityTimer(timeoutValue, $scope.leavePage);
    }
  };

  var setButtonText = function() {
    ButtonRowService.buttonRow.buttons[0].text = $scope.pageText.doneButton;
    ButtonRowService.buttonRow.buttons[1].text = $scope.pageText.receiptButton;
  };

  var setPageText = function() {
    $scope.pageText = {
      title: LanguagesService.translate('CHECK_IN_TITLE'),
      checkedInLabel: LanguagesService.translate('CHECK_IN_CHECKED_IN_LABEL'),
      notCheckedInLabel: LanguagesService.translate('CHECK_IN_NOT_CHECKED_IN_LABEL'),
      repositionLabel: LanguagesService.translate('CHECK_IN_REPOSITION_LABEL'),
      instructionsForBarcode: LanguagesService.translate('CHECK_IN_INSTRUCTIONS_FOR_BARCODE'),
      instructionsForRfid: LanguagesService.translate('CHECK_IN_INSTRUCTIONS_FOR_RFID'),
      titleColumnHeader: LanguagesService.translate('CHECK_IN_COLUMN_HEADER_FOR_TITLE'),
      itemIdColumnHeader: LanguagesService.translate('CHECK_IN_COLUMN_HEADER_FOR_ITEM_ID'),
      statusColumnHeader: LanguagesService.translate('CHECK_IN_COLUMN_HEADER_FOR_STATUS'),
      destinationLocationColumnHeader: LanguagesService.translate('CHECK_IN_COLUMN_HEADER_FOR_DESTINATION_LOCATION'),
      doneButton: LanguagesService.translate('CHECK_IN_DONE_BUTTON'),
      receiptButton: LanguagesService.translate('CHECK_IN_RECEIPT_BUTTON'),
      itemWasNotCheckedIn: LanguagesService.translate('CHECK_IN_ITEM_WAS_NOT_CHECKED_IN'),
      continueThenSeeStaff: LanguagesService.translate('CHECK_IN_CONTINUE_THEN_SEE_STAFF'),
      checkInFailedHeader: LanguagesService.translate('CHECK_IN_FAILED_HEADER'),
      receiptSubject: LanguagesService.translate('CHECK_IN_RECEIPT_EMAIL_SUBJECT'),
      receiptFailedHeader: LanguagesService.translate('CHECK_IN_RECEIPT_FAILED_HEADER')
    };
    setButtonText();
    setInstructions();
    createProcessedItemsTable();
  };

  var init = function() {
    ButtonRowService.reset();
    ButtonRowService.addButton(new ButtonRowButton({ text: 'Done', action: $scope.finish }));
    ButtonRowService.addButton(new ButtonRowButton({ text: 'Receipt', action: $scope.finishWithReceipt, enabled: false, visible: false }));

    $scope.processedItems = [];
    $scope.useRfid = BooleanValue(PreferencesService.get('UseRfid'));
    $scope.item = {
      id: ''
    };
    $scope.itemIdField = new InputField('item-id-field', canCheckin, $scope.checkin, { /*debounce: 250*/ });
    $scope.showItemIdField = !$scope.useRfid || !BooleanValue(PreferencesService.get('CheckinHideItemIdField'));
    setPageText();
    startSession();
    startInactivityTimer();

    $scope.$on('translations.received', function() {
      setPageText();
    });
  };
  init();
}]);
