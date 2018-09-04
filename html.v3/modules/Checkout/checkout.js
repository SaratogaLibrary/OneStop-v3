// Copyright(c)2017-2018 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Checkout',
[
  'ewOneStop-Defaults',
  'ewOneStop-Utilities',
  'ewOneStop-Sessions',
  'ewOneStop-Users',
  'ewOneStop-Preferences',
  'ewOneStop-ButtonRow',
  'ewOneStop-Dialogs',
  'ewOneStop-Start',
  'ewOneStop-PageTimeout',
  'ewOneStop-Recommendations',
  'ewOneStop-Receipts',
  'ewOneStop-PageLayout',
  'ewOneStop-ProcessedItems',
  'ewOneStop-PleaseWait',
  'ewOneStop-Languages',
  'ewOneStop-Holds'
])

.factory('CheckoutResult',
[
  'Defaults',
  'BooleanValue',
  'ObjectProperty',
function(Defaults, BooleanValue, ObjectProperty) {
  'use strict';

  var CheckoutResult = function(data) {
    this.ok = ObjectProperty(data, 'ok', 'No');
    this.renewalOk = ObjectProperty(data, 'renewalOk', 'No');
    this.renewalText = ObjectProperty(data, 'renewalText', '');
    this.magneticMedia = ObjectProperty(data, 'magneticMedia', 'No');
    this.desensitize = ObjectProperty(data, 'desensitize', 'No');
    this.transactionDate = ObjectProperty(data, 'transactionDate', '');
    this.userId = ObjectProperty(data, 'userId', '');
    this.id = ObjectProperty(data, 'id', '');
    this.title = ObjectProperty(data, 'title', '');
    this.dueDate = ObjectProperty(data, 'dueDate', '');
    this.feeType = ObjectProperty(data, 'feeType', '');
    this.securityInhibit = ObjectProperty(data, 'securityInhibit', 'No');
    this.currencyType = ObjectProperty(data, 'currencyType', Defaults.CURRENCY_TYPE);
    this.feeAmount = ObjectProperty(data, 'feeAmount', 0);
    this.mediaType = ObjectProperty(data, 'mediaType', '');
    this.properties = ObjectProperty(data, 'properties', '');
    this.feeTransactionId = ObjectProperty(data, 'feeTransactionId', '');
    this.screenMessage = ObjectProperty(data, 'screenMessage', '');
    this.printLine = ObjectProperty(data, 'printLine', '');
    this.rfSecurityReceipt = ObjectProperty(data, 'rfSecurityReceipt', {});
    this.rfSecurityReceipt.status = this.rfSecurityReceipt.status || 'NOT_PRINTED';
  };

  CheckoutResult.prototype.isOk = function() { return BooleanValue(this.ok); };
  CheckoutResult.prototype.isRenewalOk = function() { return BooleanValue(this.renewalOk); };
  CheckoutResult.prototype.isMagneticMedia = function() { return BooleanValue(this.magneticMedia); };
  CheckoutResult.prototype.shouldDesensitize = function() { return BooleanValue(this.desensitize); };
  CheckoutResult.prototype.inhibitSecurity = function() { return BooleanValue(this.securityInhibit); };

  CheckoutResult.create = function(data) {
    return new CheckoutResult(data);
  };

  return CheckoutResult;
}])

.factory('CheckoutService',
[
  '$http',
  '$q',
  'CheckoutResult',
  'PreferencesService',
  'BooleanValue',
function($http, $q, CheckoutResult, PreferencesService, BooleanValue) {
  'use strict';

  var performAction = function(action, itemId, userId, pin, feeAcknowledged) {
    if (typeof userId === 'boolean') {
      feeAcknowledged = userId;
      userId = undefined;
    } else if (typeof pin === 'boolean') {
      feeAcknowledged = pin;
      pin = undefined;
    }

    var options = {
          method: 'GET',
          url: '/selfCheck',
          params: {
            action: action,
            itemId: itemId,
            userId: userId,
            pin: pin,
            nextPage: 'schemas/checkoutResult.json',
            errorPage: 'schemas/checkoutError.json'
          }
        };

    if ((action === 'checkout') && feeAcknowledged) {
      options.params.feeAcknowledged = 'Y';
      options.params.suppressDuplicateCheck = 'Y';
      if (BooleanValue(PreferencesService.get('UseRfid'))) {
        options.params.flagRfidTag = 'Y';
      }
    }

    return $http(options)
            .then(function(response) {
              if (response.data.code) {
                return $q.reject(response.data);
              }
              return $q.when(CheckoutResult.create(response.data));
            }, function(error) {
              return $q.reject({ code: error.status, text: error.message || error.data });
            });
  };

  var renew = function(itemId, userId, pin) {
    return performAction('renewItem', itemId, userId, pin);
  };

  var checkout = function(itemId, userId, pin, feeCollected) {
    return performAction('checkout', itemId, userId, pin, feeCollected);
  };

  return {
    checkout: checkout,
    renew: renew
  };
}])

.controller('CheckoutController',
[
  '$scope',
  '$q',
  '$location',
  '$interval',
  '$timeout',
  '$filter',
  'SessionsService',
  'LanguagesService',
  'UsersService',
  'CheckoutService',
  'ReceiptsService',
  'ReceiptConstants',
  'RecommendationsService',
  'RecommendationDetailsDialogService',
  'HoldResult',
  'PreferencesService',
  'PleaseWaitService',
  'ButtonRowButton',
  'ButtonRowService',
  'ProcessedItems',
  'DialogService',
  'PageLayoutService',
  'StartService',
  'PageTimeoutService',
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
          $filter,
          SessionsService,
          LanguagesService,
          UsersService,
          CheckoutService,
          ReceiptsService,
          ReceiptConstants,
          RecommendationsService,
          RecommendationDetailsDialogService,
          HoldResult,
          PreferencesService,
          PleaseWaitService,
          ButtonRowButton,
          ButtonRowService,
          ProcessedItems,
          DialogService,
          PageLayoutService,
          StartService,
          PageTimeoutService,
          BooleanValue,
          InputField,
          ProcessedItemsTable,
          ProcessedItemsColumn,
          ElementFinder) {
  'use strict';

  var RFID_POLLING_INTERVAL = 500,            // milliseconds
      DEFAULT_NOVELIST_UPDATE_INTERVAL = 10,  // seconds
      NUMBER_OF_VISIBLE_RECOMMENDATIONS = (PageLayoutService.isLandscape() ? 1 : 3),
      SCROLL_AMOUNT = 20;

  $scope.showError = function(errMsg, header, showFn) {
    showFn = showFn || DialogService.showError;
    $scope.itemIdField.lockFocus = false;
    return showFn(errMsg, header)
            .then(function(result) { return $q.when(result); })
            .catch(function(error) { return $q.reject(error); })
            .finally(function() {
              $scope.itemIdField.lockFocus = true;
              $scope.itemIdField.focus();
            });
  };

  var showHoldPlacedConfirmation = function(hold) {
    var msg = $scope.pageText.holdPlaced;
    var details = '';
    if ((BooleanValue(PreferencesService.get('NovelistHoldConfirmationShowTitle'))) && hold.itemTitle) {
      details += '<p><strong>' + $scope.pageText.holdTitle + ':</strong> ' + hold.itemTitle + '</p>';
    }
    if ((BooleanValue(PreferencesService.get('NovelistHoldConfirmationShowExpirationDate'))) && hold.expirationDate) {
      details += hold.expirationDate ? '<p><strong>' + $scope.pageText.holdExpirationDate + ':</strong> ' + $filter('date')(new Date(hold.expirationDate), 'mediumDate') + '</p>' : '';
    }
    if ((BooleanValue(PreferencesService.get('NovelistHoldConfirmationShowQueuePosition'))) && (hold.queuePosition > 0)) {
      details += '<p><strong>' + $scope.pageText.holdQueuePosition + ':</strong> ' + hold.queuePosition + '</p>';
    }
    if ((BooleanValue(PreferencesService.get('NovelistHoldConfirmationShowPickupLocation'))) && (hold.pickupLocation)) {
      details += hold.pickupLocation ? '<p><strong>' + $scope.pageText.holdPickupLocation + ':</strong> ' + hold.pickupLocation + '</p>' : '';
    }

    if (details) {
      msg += ':<br><p/>' + details;
    }
    $scope.showError(msg, $scope.pageText.holdPlacedHeader, DialogService.showMessage);
  };

  $scope.showRecommendationDetails = function(recommendation) {
    var itemIdFieldIsVisible = $scope.showItemIdField;
    $scope.showItemIdField = false;
    $scope.itemIdField.lockFocus = false;
    RecommendationDetailsDialogService
    .showRecommendationDetails(recommendation)
    .then(function(result) {
      if (result && (result.how === 'HoldPlaced')) {
        showHoldPlacedConfirmation(result.data);
      } else {
        $scope.itemIdField.lockFocus = true;
        $scope.itemIdField.focus();
      }
    })
    .catch(function(error) {
      if (error !== 'timeout') {
        if (error.how === 'SaveFailed') {
          $scope.showError(error.data.text, $scope.pageText.failedToSaveRecommendationHeader);
        } else if (error.how === 'HoldFailed') {
          var errMsg;
          if (error.data instanceof HoldResult) {
            errMsg = error.data.screenMessage || error.data.error.text;
          } else {
            errMsg = error.data.text;
          }
          $scope.showError(errMsg, $scope.pageText.failedToPlaceHoldHeader);
        }
      }
    })
    .finally(function() {
      // TODO: Determine whether it is necessary to hide the input field if the field is allowed to blur
      $scope.showItemIdField = itemIdFieldIsVisible;
    });
  };

  //*
  //  sample Novelist collection
  //*
  $scope.sampleNovelistRecommendations = [
       {
         "uniqueId": "ABC123",
         "title": "Camino Island",
         "author": "John Grisham",
  	   "primaryIsbn": "978-0385543026",
  	   "primaryBibId": "536029",
         "bookjacketUrl": "https://images-na.ssl-images-amazon.com/images/I/51ccax6b1wL._SCLZZZZZZZ__BG255,255,255_AA436_.jpg",
         "description": "A gang of thieves stage a daring heist from a secure vault deep below Princeton Universityâ€™s Firestone Library. Their loot is priceless, but Princeton has insured it for twenty-five million dollars.",
         "rating": 4
       },
       {
         "uniqueId": "ABC321",
         "title": "Into the Water",
         "author": "Paula Hawkins",
  	   "primaryIsbn": "978-0735211209",
  	   "primaryBibId": "536029",
         "bookjacketUrl": "https://images-na.ssl-images-amazon.com/images/I/61OLegHQzvL._SCLZZZZZZZ__BG255,255,255_AA218_.jpg",
         "description": "An addictive new novel of psychological suspense from the author of #1 New York Times bestseller and global phenomenon The Girl on the Train.",
         "rating": 4
       },
       {
         "uniqueId": "XYZ123",
         "title": "Lincoln in the Bardo",
         "author": "George Saunders",
  	   "primaryIsbn": "978-0812995343",
  	   "primaryBibId": "536029",
         "bookjacketUrl": "https://images-na.ssl-images-amazon.com/images/I/61-1atkJmYL._SCLZZZZZZZ__BG255,255,255_AA436_.jpg",
         "description": "The long-awaited first novel from the author of Tenth of December: a moving and original father-son story featuring none other than Abraham Lincoln, as well as an unforgettable cast of supporting characters, living and dead.",
         "rating": 5
       },
       {
         "uniqueId": "XYZ321",
         "title": "Since We Fell",
         "author": "Dennis Lehane",
  	   "primaryIsbn": "978-0062129383",
  	   "primaryBibId": "28916",
         "bookjacketUrl": "https://images-na.ssl-images-amazon.com/images/I/51J9QCcmvJL._SCLZZZZZZZ__BG255,255,255_AA436_.jpg",
         "description": "The new novel from New York Times bestseller Dennis Lehane, author of Mystic River and Shutter Island",
         "rating": 4
       }
     ];

  var recommendationsInterval,
      visibleRecommendationIndex = 0;
  $scope.getRecommendations = function() {
    if (BooleanValue(PreferencesService.get('NovelistEnabled'))) {
      console.log('Requesting recommendations');
      if (!BooleanValue(PreferencesService.get('NovelistUseDemoMode'))) {
        // Use real Novelist recommendations
        RecommendationsService.getRecommendations()
        .then(function(recommendations) {
          $scope.recommendations = recommendations;
          if (!recommendationsInterval) {
            var updateInterval = Number(PreferencesService.get('NovelistUiUpdateInterval', DEFAULT_NOVELIST_UPDATE_INTERVAL));
            if (!isNaN(updateInterval)) {
              console.log('Starting the Recommendations Poll Timer');
              recommendationsInterval = $interval($scope.getRecommendations, updateInterval * 1000);
            }
          }
        });
      } else {
        // Use stubbed recommendation data (for demos and testing)
        $scope.recommendations = $scope.sampleNovelistRecommendations;
        var updateInterval = Number(PreferencesService.get('NovelistUiUpdateInterval', DEFAULT_NOVELIST_UPDATE_INTERVAL));
        if (!isNaN(updateInterval) && !recommendationsInterval) {
          console.log('Starting the Recommendations Poll Timer');
          recommendationsInterval = $interval($scope.getRecommendations, updateInterval * 1000);
        }
      }

      // TODO: Write tests
      $scope.visibleRecommendations = [];
      var count = Math.min(NUMBER_OF_VISIBLE_RECOMMENDATIONS, $scope.recommendations.length);
      for (var x = 0; x < count; ++x) {
        if ((++visibleRecommendationIndex) >= $scope.recommendations.length) {
          visibleRecommendationIndex = 0;
        }

        $scope.visibleRecommendations.push($scope.recommendations[visibleRecommendationIndex]);
      }
    }
  };

  var updateProcessedItems = function(session, playSound) {
    var priorItemCount = $scope.processedItems.length;
    $scope.processedItems = ProcessedItems.mergeCheckouts($scope.processedItems, session, playSound);
    if ($scope.processedItems.length > 0) {
      if ($scope.processedItems.length > priorItemCount) {
        PageTimeoutService.resetInactivityTimer();
      }

      if ((canPrintReceipt() || canEmailReceipt())) {
        ButtonRowService.buttonRow.buttons[2].visible = true;
        ButtonRowService.buttonRow.buttons[2].enabled = true;
      }
    }
    $scope.session = session;
  };

  var recommendationsRequested = false;
  $scope.refreshSession = function() {
    SessionsService.refresh('checkout')
    .then(function(session) {
      if (!recommendationsRequested && (session.numberOfCheckedOutItems > 0)) {
        recommendationsRequested = true;
        var delay = Number(PreferencesService.get('NovelistInitialCheckInterval'));
        if (!delay || isNaN(delay)) {
          delay = 2;
        }
        $timeout($scope.getRecommendations, delay * 1000);
      }

      updateProcessedItems(session);
    })
    .catch(function(error) {
      console.error('Failed to update the session: ' + error);
    });
  };

  var canCheckout = function(itemId) {
    if (!itemId) {
      itemId = $scope.item.id;
    }
    return !(!itemId);
  };

  $scope.checkout = function(itemId, feeAcknowledged) {
    if (itemId && typeof itemId === 'boolean') {
      feeAcknowledged = itemId;
      itemId = undefined;
    }
    if (!itemId) {
      itemId = $scope.item.id;
      $scope.item.id = '';
    }
    if (canCheckout(itemId)) {
      // Cancel any input field updates that have not yet been processed
			if ($scope.itemIdForm && $scope.itemIdForm.$rollbackViewValue) {
				$scope.itemIdForm.$rollbackViewValue();
			}

      CheckoutService.checkout(itemId, feeAcknowledged)
      .then(function(checkoutResult) {
        if (checkoutResult.rfSecurityReceipt.status === 'PRINTED') {
          var dlgOptions = {
                text: LanguagesService.translate('CHECK_OUT_RF_SECURITY_RECEIPT_NOTICE', [checkoutResult.title]),
                image: {
                  path: '/assets/images/SecurityReceipt.gif',
                  width: '400',
                  height: '270'
                },
                timeout: Number(PreferencesService.get('CheckoutRfSecurityReceiptNotificationTimeout', 0)),
                layout: 'TEXT_TOP'
              };
          DialogService.show(dlgOptions);
        } else if (checkoutResult.rfSecurityReceipt.status === 'PRINTER_ERROR') {
          var printerErrorMsg = LanguagesService.translate('CHECK_OUT_RF_SECURITY_RECEIPT_PRINTER_ERROR', [checkoutResult.title]);
          DialogService.showWarning(printerErrorMsg);
        } else if (checkoutResult.rfSecurityReceipt.status === 'TEMPLATE_ERROR') {
          var templateErrorMsg = LanguagesService.translate('CHECK_OUT_RF_SECURITY_RECEIPT_TEMPLATE_ERROR', [checkoutResult.title]);
          DialogService.showWarning(templateErrorMsg);
        }
      })
      .catch(function(error) {
        if (BooleanValue(PreferencesService.get('CheckoutDisplayFailureNotificationsForBarcodeCheckout'))) {
          var errMsg = $scope.pageText.itemWasNotCheckedOut,
              itemDetails = itemId;
          if (error.item && error.item.title) {
            itemDetails += ': ' + error.item.title;
          }
          errMsg += '<br/><br/>' + itemDetails + ' (' + error.text + ')<br/>';

          if (!(error.item && error.item.feeAmount && (Number(error.item.feeAmount) > 0))) {
            errMsg += $scope.pageText.continueThenSeeStaff;
          }
          $scope.showError(errMsg, $scope.pageText.checkOutFailedHeader);
        }
      })
      .finally(function() {
        $scope.refreshSession();
      });
    }
  };

  $scope.confirmFee = function(item) {
    var header = $scope.pageText.feeNoticeHeader;
    var buttons = [
      { id: 'OK', text: $scope.pageText.okButton },
      { id: 'CANCEL', text: $scope.pageText.cancelButton }
    ];
    var currencySymbol = PreferencesService.get('CurrencySymbol');
    var text = '<br/><br/>' + LanguagesService.translate('CHECK_OUT_FEE_NOTICE', [ $filter('currency')(item.feeAmount, currencySymbol) ]) + '<br/>';
    text += '<p class="text-center">' + item.title + '</p>';
    text += '<br/>' + $scope.pageText.feeNoticeInstructions + '<br/>';

    DialogService.showPrompt(text, header, buttons)
    .then(function(choice) {
      if (choice === buttons[0].id) {
        $scope.checkout(item.id, true);
      }
    });
  };

  $scope.showMyAccount = function() {
    $scope.showItemIdField = false;
    cancelRfidPolling();
    cancelRecommendationsPolling();
    $location.search('startOver', 'checkout');
    $location.path('myAccount');
  };

  $scope.finishWithReceipt = function() {
    cleanUp()
    .then(function() {
      if (canPrintReceipt() || canEmailReceipt()) {
        if (!canEmailReceipt() && $scope.mustPrintReceipt() && $scope.session.isPrinterReady()) {
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
    cleanUp()
    .then(function() {
      if ((canPrintReceipt() || canEmailReceipt()) && $scope.processedItems.length && $scope.mustPrintReceipt() && $scope.session.isPrinterReady()) {
        if (!canEmailReceipt()/* && $scope.mustPrintReceipt() && $scope.session.isPrinterReady()*/) {
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

  var scroll = function(amount) {
    var tableBody = ElementFinder.find('#scrollable-table-body')[0];
    var curScrollVal = tableBody.scrollTop;
    //alert(curScrollVal);
    tableBody.scrollTop = curScrollVal + amount;
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

  var doReceipt = function(mode, emailOptions) {
    PleaseWaitService.setWaiting(true);
    var templateName = ReceiptsService.getTemplateName('checkout', $scope.session.currentLanguageCode);
    var printer = PreferencesService.get('ReceiptPrinterName');
    ReceiptsService
    .provideCheckoutReceipt(templateName, mode, printer, emailOptions)
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
            .show(true, UsersService.getCurrentUser().emailAddress)
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
      .show(canPrintReceipt(), canEmailReceipt(), $scope.mustPrintReceipt(), $scope.session.isPrinterReady())
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

  var rfidInterval;
  var enableRfid = function() {
    var rfidEnabled;
    if (!$location.search().inProgress) {
      console.log('Enabling RFID');
      rfidEnabled = SessionsService.enableRfidCheckout();
    } else {
      console.log('Checkout is already in progress; no need to enable RFID');
      rfidEnabled = $q.when();
    }

    rfidEnabled
    .then(function() {
      console.log('Starting the RFID Poll Timer');
      rfidInterval = $interval($scope.refreshSession, RFID_POLLING_INTERVAL);
    })
    .catch(function(error) {
      $scope.showError(error.text);
    });
  };

  var disableRfid = function() {
    if ($scope.useRfid) {
      return SessionsService.disableRfid('checkout')
              .then(function() {
                cancelRfidPolling();
                return $q.when();
              });
    } else {
      return $q.when();
    }
  };

  var cancelRfidPolling = function() {
    if (rfidInterval) {
      console.log('Canceling RFID polling');
      if ($interval.cancel(rfidInterval)) {
        console.log('RFID polling canceled');
      }
      rfidInterval = undefined;
    }
  };

  var cancelRecommendationsPolling = function() {
    if (recommendationsInterval) {
      console.log('Canceling Recommendations polling');
      if ($interval.cancel(recommendationsInterval)) {
        console.log('Recommendations polling canceled');
      }
      recommendationsInterval = undefined;
    }
  };

  var cleanUp = function() {
    console.log('Cleaning up');
    return disableRfid()
            .then(function() {
              cancelRecommendationsPolling();
              return $q.when();
            });
  };

  $scope.leavePage = function() {
    cleanUp()
    .then(function() {
      UsersService.setCurrentUser(null);
      $location.search('inProgress', null);
      StartService.startOver();
    });
  };

  var canPrintReceipt = function() {
    return BooleanValue(PreferencesService.get('CheckoutPrintReceipt'));
  };

  $scope.mustPrintReceipt = function() {
    var requiredMediaTypes = PreferencesService.get('CheckoutForceReceiptForMediaTypes');
    if (requiredMediaTypes.indexOf(',') >= 0) {
      requiredMediaTypes = requiredMediaTypes.split(',').map(function(i) { return Number(i.trim()); });
    } else if ((requiredMediaTypes === '') || isNaN(requiredMediaTypes)) {
      requiredMediaTypes = [];
    } else {
      requiredMediaTypes = [ Number(requiredMediaTypes) ];
    }

    var isRequiredMediaType = function(processedItem) {
      return requiredMediaTypes.indexOf(processedItem.item.mediaTypeCode) >= 0;
    };

    return ((PreferencesService.get('CheckoutPrintReceipt') === '1') || $scope.processedItems.some(isRequiredMediaType));
  };

  var canEmailReceipt = function() {
    return BooleanValue(PreferencesService.get('CheckoutSendEmailReceipt'));
  };

  var getSession = function() {
    SessionsService.refresh('checkout')
    .then(function(session) {
      if (!session.isLoggedIn()) {
        $scope.showError($scope.pageText.notSignedInError)
        .then(function() {})
        .catch(function() {})
        .finally(function() {
          $scope.leavePage();
        });
      } else {
        var currentUser = UsersService.getCurrentUser();
        if (session.userId !== currentUser.id) {
          $scope.showError($scope.pageText.wrongUserError)
          .then(function() {})
          .catch(function() {})
          .finally(function() {
            $scope.leavePage();
          });
        } else if (!currentUser.hasChargePrivileges()) {
          console.log('No charge privileges');
          $location.path('myAccount');
        } else {
          updateProcessedItems(session, false);
          if ($scope.useRfid) {
            enableRfid();
          }
        }
      }
    })
    .catch(function(error) {
      $scope.showError(error.text);
      $scope.session = {};
    });
  };

  var setInstructions = function() {
    var isX11 = (PreferencesService.get('HardwareModel').substr(0, 3) === 'X11');
    $scope.animationPath = '/assets/animations/';
    $scope.checkoutAnimationClass = 'no-media-case-controller';
    if ($scope.useRfid) {
      $scope.instructions = $scope.pageText.instructionsForRfid;
      $scope.caseControllerAttached = BooleanValue(PreferencesService.get('HardwareCaseControllerAttached'));
      if (isX11) {
        $scope.animationPath += $scope.caseControllerAttached ? 'X11-Book-DVD-Composite.gif' : 'X11-RFID-Books.gif';
      } else {
        $scope.animationPath += $scope.caseControllerAttached ? 'ProLine-Book-DVD-Composite.gif' : 'ProLine-RFID-Books.gif';
      }
      if ($scope.caseControllerAttached) {
        $scope.checkoutAnimationClass = 'with-media-case-controller';
      }
    } else {
      $scope.instructions = $scope.pageText.instructionsForBarcode;
      $scope.animationPath += isX11 ? 'X11-Barcode-Book-Scan.gif' : 'ProLine-Barcode-Book-Scan.gif';
      $scope.caseControllerAttached = false;
    }
  };

  var createProcessedItemsTable = function() {
    var columns = [
      new ProcessedItemsColumn($scope.pageText.titleColumnHeader, Number(PreferencesService.get('CheckoutColumnTitle') || 1), 'title'),
      new ProcessedItemsColumn($scope.pageText.itemIdColumnHeader, Number(PreferencesService.get('CheckoutColumnItemId') || 2), 'id'),
      new ProcessedItemsColumn($scope.pageText.dueDateColumnHeader, Number(PreferencesService.get('CheckoutColumnDueDate') || 3), 'dueDate'),
      new ProcessedItemsColumn($scope.pageText.statusColumnHeader, Number(PreferencesService.get('CheckoutColumnStatus') || 4), 'status')
    ];
    $scope.processedItemsTable = new ProcessedItemsTable(columns);
  };

  var startInactivityTimer = function() {
    var timeoutValue = Number(PreferencesService.get('PageLongTimeout'));
    if (!isNaN(timeoutValue) && (timeoutValue > 0)) {
      PageTimeoutService.startInactivityTimer(timeoutValue, $scope.leavePage);
    }
  };

  var setButtonText = function() {
    ButtonRowService.buttonRow.buttons[0].text = $scope.pageText.myAccountButton;
    ButtonRowService.buttonRow.buttons[1].text = $scope.pageText.doneButton;
    ButtonRowService.buttonRow.buttons[2].text = $scope.pageText.receiptButton;
  };

  var setPageText = function() {
    $scope.pageText = {
      title: LanguagesService.translate('CHECK_OUT_TITLE'),
      myAccountButton: LanguagesService.translate('CHECK_OUT_MY_ACCOUNT_BUTTON'),
      doneButton: LanguagesService.translate('CHECK_OUT_DONE_BUTTON'),
      receiptButton: LanguagesService.translate('CHECK_OUT_RECEIPT_BUTTON'),
      instructionsForCheckOutWithCaseController: LanguagesService.translate('CHECK_OUT_INSTRUCTIONS_FOR_CHECK_OUT_WITH_CASE_CONTROLLER'),
      instructionsForUnlockWithCaseController: LanguagesService.translate('CHECK_OUT_INSTRUCTIONS_FOR_UNLOCK_WITH_CASE_CONTROLLER'),
      instructionsForBarcode: LanguagesService.translate('CHECK_OUT_INSTRUCTIONS_FOR_BARCODE'),
      instructionsForRfid: LanguagesService.translate('CHECK_OUT_INSTRUCTIONS_FOR_RFID'),
      titleColumnHeader: LanguagesService.translate('CHECK_OUT_COLUMN_HEADER_FOR_TITLE'),
      itemIdColumnHeader: LanguagesService.translate('CHECK_OUT_COLUMN_HEADER_FOR_ITEM_ID'),
      dueDateColumnHeader: LanguagesService.translate('CHECK_OUT_COLUMN_HEADER_FOR_DUE_DATE'),
      statusColumnHeader: LanguagesService.translate('CHECK_OUT_COLUMN_HEADER_FOR_STATUS'),
      checkedOutLabel: LanguagesService.translate('CHECK_OUT_CHECKED_OUT_LABEL'),
      notCheckedOutLabel: LanguagesService.translate('CHECK_OUT_NOT_CHECKED_OUT_LABEL'),
      repositionLabel: LanguagesService.translate('CHECK_OUT_REPOSITION_LABEL'),
      notSignedInError: LanguagesService.translate('CHECK_OUT_NOT_SIGNED_IN_ERROR'),
      wrongUserError: LanguagesService.translate('CHECK_OUT_WRONG_USER_ERROR'),
      itemWasNotCheckedOut: LanguagesService.translate('CHECK_OUT_ITEM_WAS_NOT_CHECKED_OUT'),
      continueThenSeeStaff: LanguagesService.translate('CHECK_OUT_CONTINUE_THEN_SEE_STAFF'),
      checkOutFailedHeader: LanguagesService.translate('CHECK_OUT_FAILED_HEADER'),
      feeNoticeHeader: LanguagesService.translate('CHECK_OUT_FEE_NOTICE_HEADER'),
      feeNoticeInstructions: LanguagesService.translate('CHECK_OUT_FEE_NOTICE_INSTRUCTIONS'),
      okButton: LanguagesService.translate('CHECK_OUT_OK_BUTTON'),
      cancelButton: LanguagesService.translate('CHECK_OUT_CANCEL_BUTTON'),
      receiptSubject: LanguagesService.translate('CHECK_OUT_RECEIPT_EMAIL_SUBJECT'),
      receiptFailedHeader: LanguagesService.translate('CHECK_OUT_RECEIPT_FAILED_HEADER'),
      failedToSaveRecommendationHeader: LanguagesService.translate('CHECK_OUT_FAILED_TO_SAVE_RECOMMENDATION_HEADER'),
      failedToPlaceHoldHeader: LanguagesService.translate('CHECK_OUT_FAILED_TO_PLACE_HOLD_HEADER'),
      novelistHeader: LanguagesService.translate('CHECK_OUT_NOVELIST_HEADER'),
      novelistByLine: LanguagesService.translate('CHECK_OUT_NOVELIST_BY_LINE'),
      poweredByNovelist: LanguagesService.translate('CHECK_OUT_NOVELIST_ATTRIBUTION'),
      holdPlaced: LanguagesService.translate('CHECK_OUT_HOLD_PLACED'),
      holdPlacedHeader: LanguagesService.translate('CHECK_OUT_HOLD_PLACED_HEADER'),
      holdTitle: LanguagesService.translate('CHECK_OUT_HOLD_TITLE_LABEL'),
      holdExpirationDate: LanguagesService.translate('CHECK_OUT_HOLD_EXPIRATION_DATE_LABEL'),
      holdQueuePosition: LanguagesService.translate('CHECK_OUT_HOLD_QUEUE_POSITION_LABEL'),
      holdPickupLocation: LanguagesService.translate('CHECK_OUT_HOLD_PICKUP_LOCATION_LABEL')
    };
    createProcessedItemsTable();
    setInstructions();
    setButtonText();
  };

  var init = function() {
    ButtonRowService.reset();
    ButtonRowService.addButton(new ButtonRowButton({ text: 'My Account', action: $scope.showMyAccount }));
    ButtonRowService.addButton(new ButtonRowButton({ text: 'Done', action: $scope.finish }));
    ButtonRowService.addButton(new ButtonRowButton({ text: 'Receipt', action: $scope.finishWithReceipt, enabled: false, visible: false }));

    $scope.useRfid = BooleanValue(PreferencesService.get('UseRfid'));

    $scope.item = {
      id: ''
    };
    $scope.itemIdField = new InputField('item-id-field', canCheckout, $scope.checkout, { /*debounce: 250*/ });
    $scope.showItemIdField = !$scope.useRfid || !BooleanValue(PreferencesService.get('CheckoutHideItemIdField'));
    $scope.processedItems = [];
    $scope.recommendations = [];
    $scope.visibleRecommendations = [];
    setPageText();
    getSession();
    startInactivityTimer();

    $scope.$on("translations.received", function() {
      setPageText();
    });
  };
  init();
}]);
