// Copyright(c)2017-2018 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Login',
[
  'ngRoute',
  'ewOneStop-Preferences',
  'ewOneStop-Languages',
  'ewOneStop-Users',
  'ewOneStop-Rfid',
  'ewOneStop-ButtonRow',
  'ewOneStop-Dialogs',
  'ewOneStop-PrinterStatus',
  'ewOneStop-Start',
  'ewOneStop-PageTimeout',
  'ewOneStop-Utilities',
  'ewOneStop-PleaseWait',
  'ewOneStop-Themes'      // Needed for tests since they load the page as a template
])

.factory('LoginService',
[
  '$location',
  '$q',
  'UsersService',
  'SessionsService',
  'MyAccountService',
  'PreferencesService',
  'PleaseWaitService',
  'PrinterStatus',
  'StartService',
  'BooleanValue',
function( $location,
          $q,
          UsersService,
          SessionsService,
          MyAccountService,
          PreferencesService,
          PleaseWaitService,
          PrinterStatus,
          StartService,
          BooleanValue) {
  'use strict';

  var login = function(target, userId, pin) {
    var staffUserId = PreferencesService.get('StaffUserId');
    if (staffUserId && (userId === staffUserId)) {
      $location.path('staffMenu');
      return $q.when();
    } else if (BooleanValue(PreferencesService.get('IlsRequireUserPin')) && !pin) {
      $location.search('target', target || 'checkout');
      $location.search('userId', userId);
      $location.path('enterPin');
      return $q.when();
    } else {
      PleaseWaitService.setWaiting(true);
      return UsersService.getUser(userId, pin)
              .then(function(user) {
                PleaseWaitService.setWaiting(false);
                UsersService.setCurrentUser(user);
                $location.search('userId', null);
                $location.search('target', null);

                if ((target === 'myAccount') || MyAccountService.shouldShow(user)) {
                  $location.path('myAccount');
                  return $q.when();
                } else {
                  var printerStatus = $location.search().printerStatus,
                      promise;

                  if (['WARNING_SHOWN', 'WARNING_DISABLED'].indexOf(printerStatus) >= 0) {
                    promise = $q.when();
                  } else {
                    promise = PrinterStatus.check('Checkout');
                  }

                  $location.search('printerStatus', null);
                  promise.then(function() {
                    $location.path('checkout');
                  })
                  .catch(function() {
                    StartService.startOver();
                  })
                  .finally(function() {
                    return $q.when();
                  });
                }
              })
              .catch(function(error) {
                PleaseWaitService.setWaiting(false);
                SessionsService.reset();
                return $q.reject(error);
              });
    }
  };

  return {
    login: login
  };
}])

.controller('EnterUserIdController',
[
  '$rootScope',
  '$scope',
  '$location',
  '$route',
  '$interval',
  '$q',
  'PreferencesService',
  'LanguagesService',
  'LoginService',
  'RfidService',
  'ButtonRowButton',
  'ButtonRowService',
  'DialogService',
  'StartService',
  'PageTimeoutService',
  'BooleanValue',
  'InputField',
  'ElementFinder',
function( $rootScope,
          $scope,
          $location,
          $route,
          $interval,
          $q,
          PreferencesService,
          LanguagesService,
          LoginService,
          RfidService,
          ButtonRowButton,
          ButtonRowService,
          DialogService,
          StartService,
          PageTimeoutService,
          BooleanValue,
          InputField,
          ElementFinder) {
  'use strict';

  $scope.showError = function(errMsg) {
    $scope.userIdField.lockFocus = false;
    DialogService.showError(errMsg)
    .then(function() {})
    .catch(function() {})
    .finally(function() {
      $scope.userIdField.lockFocus = true;
      $scope.userIdField.focus();
    });
  };

  $scope.keyPadClick = function(char) {
    $scope.login.userId += char;
  };

  $scope.backspace = function() {
    if ($scope.login.userId.length > 0) {
      $scope.login.userId = $scope.login.userId.substr(0, $scope.login.userId.length - 1);
    }
  };

  $scope.clearInput = function() {
    $scope.login.userId = '';
  };

  $scope.toggleAlphaKeyboard = function() {
    if ($scope.should.showAlphanumericKeyboard) {
      $scope.keyboard.visible = !$scope.keyboard.visible;
      $scope.animationVisible = !$scope.animationVisible;
    }
  };

  $scope.canSubmit = function() {
    return !!$scope.login.userId && ($scope.login.userId.length > 0) && !$scope.submitted;
  };

  $scope.submit = function() {
    if (!$scope.submitted) {
      $scope.submitted = true;

      // Cancel any input field updates that have not yet been processed
			if ($scope.loginForm && $scope.loginForm.$rollbackViewValue) {
				$scope.loginForm.$rollbackViewValue();
			}

      LoginService.login($location.search().target, $scope.login.userId)
      .then(function() {
        // The login service handles all of the success cases
        // but we do need to turn off the RFID reader if it is running
        $scope.disableRfid();
      })
      .catch(function(error) {
        $scope.clearInput();

        var errMsg = $scope.pageText.userNotFound;
        errMsg += '<br/><br/>(' + error.text + ')<br/>';
        $scope.showError(errMsg, $scope.pageText.userNotFoundHeader);
        $scope.submitted = false;
      });
    }
  };

  $scope.startOver = function(page) {
    $scope.disableRfid()
    .then(function() {})
    .catch(function() {})
    .finally(function() {
      clearTargetParam();
      clearPrinterStatusParam();
      if (!page) {
        StartService.startOver();
      } else {
        $location.path(page);
      }
    });
  };

  $scope.goToMenu = function() {
    $scope.startOver('menu');
  };

  var clearTargetParam = function() {
    $location.search('target', null);
  };

  var clearPrinterStatusParam = function() {
    $location.search('printerStatus', null);
  };

  var startInactivityTimer = function() {
    var timeoutValue = Number(PreferencesService.get('PageTimeout'));
    if (!isNaN(timeoutValue) && (timeoutValue > 0)) {
      PageTimeoutService.startInactivityTimer(timeoutValue, $scope.startOver);
    }
  };

  var setInstructions = function() {
    $scope.instructions = $scope.pageText.instructions;
    //$scope.instructions += $location.search().target === 'myAccount' ? 'access your account' : 'checkout';

    var model = PreferencesService.get('HardwareModel');
    $scope.animationPath = '/assets/animations/';
    $scope.animationPath += (model.substr(0, 3) === 'X11' ? 'X11-Barcode-Library-Card-Scan.gif' : 'ProLine-Barcode-Library-Card-Scan.gif');
  };

  var setButtonText = function() {
    ButtonRowService.buttonRow.buttons.forEach(function(button) {
      if (button.action === $scope.goToMenu) {
        button.text = $scope.pageText.moreOptionsButton;
      } else if (button.action === $scope.startOver) {
        button.text = $scope.pageText.startOverButton;
      } else if (button.action === $scope.submit) {
        button.text = $scope.pageText.nextButton;
      }
    });
  };

  var setPageText = function() {
    $scope.pageText = {
      instructions: LanguagesService.translate('LOGIN_ENTER_LIBRARY_CARD_INSTRUCTIONS'),
      moreOptionsButton: LanguagesService.translate('LOGIN_OTHER_OPTIONS_BUTTON'),
      startOverButton: LanguagesService.translate('LOGIN_START_OVER_BUTTON'),
      nextButton: LanguagesService.translate('LOGIN_NEXT_BUTTON'),
      keypadClearButton: LanguagesService.translate('KEYPAD_CLEAR_BUTTON'),
      keypadAToZButton: LanguagesService.translate('KEYPAD_A_TO_Z_BUTTON'),
      userNotFound: LanguagesService.translate('LOGIN_USER_NOT_FOUND'),
      userNotFoundHeader: LanguagesService.translate('LOGIN_USER_NOT_FOUND_HEADER')
    };
    setInstructions();
    setButtonText();
  };

  $scope.getRfidLibraryCard = function() {
    RfidService.getLibraryCard()
    .then(function(cardNumber) {
      if (cardNumber) {
        $scope.login.userId = cardNumber;
        $scope.submit();
      }
    })
    .catch(function(/*error*/) {
      // RfidService.getLibraryCard does not reject unless the underlying $http service does - not much to do here
    });
  };

  var rfidInterval;
  var enableRfid = function() {
    if (BooleanValue(PreferencesService.get('UseRfid')) && BooleanValue(PreferencesService.get('UseRfidLibraryCards'))) {
      RfidService.enableRfid('libraryCard', 'statusSession')
      .then(function() {
        rfidInterval = $interval($scope.getRfidLibraryCard, 500);
      })
      .catch(function() {
        // TODO: Decide whether the user should see an error if RFID cannot be enabled to read library cards
      });
    }
  };

  $scope.disableRfid = function() {
    if (rfidInterval) {
      $interval.cancel(rfidInterval);
      return RfidService.disableRfid('statusSession');
    } else {
      return $q.when();
    }
  };

  var init = function() {
    ButtonRowService.reset();
    if ($route && $route.current && $route.current.originalPath && StartService.isInitialState($route.current.originalPath)) {
      if (BooleanValue(PreferencesService.get('CheckoutScreenShowOtherOptionsButton'))) {
        ButtonRowService.addButton(new ButtonRowButton({ text: 'Other Options', action: $scope.goToMenu }));
      }
      $rootScope.$broadcast('headerImage.resume', {});
    } else {
      ButtonRowService.addButton(new ButtonRowButton({ text: 'Start Over', action: $scope.startOver }));
      startInactivityTimer();
    }
    //ButtonRowService.addButton(new ButtonRowButton({ text: 'Next »', action: $scope.submit, enabled: false }));

    setPageText();

    $scope.submitted = false;
    $scope.login = {
      userId: ''
    };

    $scope.should = {
      showKeypad: BooleanValue(PreferencesService.get('ShowKeypadOnUserIdPage')),
      showAlphanumericKeyboard: BooleanValue(PreferencesService.get('ShowAlphanumericKeypadOnUserIdPage'))
    };

    $scope.animationVisible = true;

    var keypadStyle = PreferencesService.get('AlphanumericKeypadStyle');
    $scope.keyboard = {
      layout: (keypadStyle === '2') ? 'QWERTY' : 'ALPHA',
      visible: false,
      inputField: 'user-id-field',
      lowerCase: true,
      showHideButton: false
    };

    enableRfid();

    $scope.userIdField = new InputField('user-id-field', $scope.canSubmit, $scope.submit, { /*debounce: 250*/ });
    $scope.$watch('login.userId', function(newValue) {
      var buttons = ButtonRowService.buttonRow.buttons;
      buttons[buttons.length - 1].enabled = $scope.canSubmit();
      if (newValue) {
        $rootScope.$broadcast('headerImage.pause');
      }

      if (!PageTimeoutService.isRunning() && $scope.login.userId) {
        startInactivityTimer();
      }

      var maxUserIdLength = Number(PreferencesService.get('MaxUserIdLength'));
      if ((maxUserIdLength > 0) && ($scope.login.userId.length >= maxUserIdLength)) {
        $scope.submit();
      } else {
        var fontSize = '2rem';
        if ($scope.login.userId && ($scope.login.userId.length > 4)) {
          var myFontSize = Math.max(2 - (0.1 * ($scope.login.userId.length - 4)), 1.2);
          fontSize = myFontSize+'rem';
        }
        var elem = ElementFinder.find('#user-id-field');
        elem.css('fontSize', fontSize);
        elem.css('height', '44px');
      }
    });

    $scope.$on('translations.received', function() {
      setPageText();
    });
  };
  init();
}])

.controller('EnterPinController',
[
  '$scope',
  '$location',
  'LoginService',
  'User',
  'LanguagesService',
  'PreferencesService',
  'ButtonRowButton',
  'ButtonRowService',
  'DialogService',
  'StartService',
  'PageTimeoutService',
  'InputField',
  'BooleanValue',
function( $scope,
          $location,
          LoginService,
          User,
          LanguagesService,
          PreferencesService,
          ButtonRowButton,
          ButtonRowService,
          DialogService,
          StartService,
          PageTimeoutService,
          InputField,
          BooleanValue) {
  'use strict';

  $scope.showError = function(errMsg, errHeader, callback) {
    if (typeof errHeader === 'function') {
      callback = errHeader;
      errHeader = undefined;
    }
    $scope.pinField.lockFocus = false;
    DialogService.showError(errMsg, errHeader)
    .then(callback)
    .catch(function() {})
    .finally(function() {
      $scope.pinField.lockFocus = true;
      $scope.pinField.focus();
    });
  };

  $scope.keyPadClick = function(char) {
    $scope.login.pin += char;
  };

  $scope.backspace = function() {
    if ($scope.login.pin.length > 0) {
      $scope.login.pin = $scope.login.pin.substr(0, $scope.login.pin.length - 1);
    }
  };

  $scope.clearInput = function() {
    $scope.login.pin = '';
  };

  $scope.toggleAlphaKeyboard = function() {
    if ($scope.should.showAlphanumericKeyboard) {
      $scope.keyboard.visible = !$scope.keyboard.visible;
      // TODO: Add test
      if ($scope.keyboard.visible) {
        $scope.loginAndKeyboardWrapperClass = "offset-for-alpha-keyboard";
      } else {
        $scope.loginAndKeyboardWrapperClass = "";
      }
    }
  };

  $scope.canSubmit = function() {
    return !!$scope.login.pin && ($scope.login.pin.length > 0) && !$scope.submitted;
  };

  $scope.submit = function() {
    $scope.submitted = true;

    // Cancel any input field updates that have not yet been processed
    if ($scope.loginForm && $scope.loginForm.$rollbackViewValue) {
      $scope.loginForm.$rollbackViewValue();
    }

    LoginService.login($location.search().target, $scope.login.userId, $scope.login.pin)
    .then(function() {
      // LoginService handles all of the success cases
    })
    .catch(function(error) {
      var next,
          errMsg = error.text,
          errHeader;
      if (error.user && error.user.id) {
        var user = new User(error.user);
        next = function() {
          if (user.isValid()) {
            // Problem is with user's password
            $scope.clearInput();
          } else {
            $scope.goBack();
          }
        };

        if (user.isValid()) {
          errHeader = $scope.pageText.invalidPinHeader;
        } else {
          errMsg = $scope.pageText.userNotFound;
          errMsg += '<br/><br/>(' + error.text + ')<br/>';
          errHeader = $scope.pageText.userNotFoundHeader;
        }
      }
      $scope.showError(errMsg, errHeader, next);
      $scope.submitted = false;
    });
  };

  $scope.startOver = function() {
    clearTargetParam();
    clearUserIdParam();
    clearPrinterStatusParam();
    $location.search('userId', null);
    StartService.startOver();
  };

  $scope.goBack = function() {
    clearUserIdParam();
    $location.path('login');
  };

  var clearTargetParam = function() {
    $location.search('target', null);
  };

  var clearUserIdParam = function() {
    $location.search('userId', null);
  };

  var clearPrinterStatusParam = function() {
    $location.search('printerStatus', null);
  };

  var startInactivityTimer = function() {
    var timeoutValue = Number(PreferencesService.get('PageTimeout'));
    if (!isNaN(timeoutValue) && (timeoutValue > 0)) {
      PageTimeoutService.startInactivityTimer(timeoutValue, $scope.startOver);
    }
  };

  var setButtonText = function() {
    ButtonRowService.buttonRow.buttons[0].text = $scope.pageText.startOverButton;
    ButtonRowService.buttonRow.buttons[1].text = $scope.pageText.backButton;
    ButtonRowService.buttonRow.buttons[2].text = $scope.pageText.nextButton;
  };

  var setPageText = function() {
    $scope.pageText = {
      instructions: LanguagesService.translate('LOGIN_ENTER_PIN_INSTRUCTIONS'),
      startOverButton: LanguagesService.translate('LOGIN_START_OVER_BUTTON'),
      nextButton: LanguagesService.translate('LOGIN_NEXT_BUTTON'),
      backButton: LanguagesService.translate('LOGIN_BACK_BUTTON'),
      keypadClearButton: LanguagesService.translate('KEYPAD_CLEAR_BUTTON'),
      keypadAToZButton: LanguagesService.translate('KEYPAD_A_TO_Z_BUTTON'),
      missingUserIdParameter: LanguagesService.translate('LOGIN_MISSING_USER_ID_PARAMETER', [ 'userId' ]),
      userNotFound: LanguagesService.translate('LOGIN_USER_NOT_FOUND'),
      userNotFoundHeader: LanguagesService.translate('LOGIN_USER_NOT_FOUND_HEADER'),
      invalidPinHeader: LanguagesService.translate('LOGIN_INVALID_PIN_HEADER')
    };
    setButtonText();
  };

  var init = function() {
    ButtonRowService.reset();
    ButtonRowService.addButton(new ButtonRowButton({ text: 'Start Over', action: $scope.startOver }));
    ButtonRowService.addButton(new ButtonRowButton({ text: 'Back', action: $scope.goBack }));
    ButtonRowService.addButton(new ButtonRowButton({ text: 'Next »', action: $scope.submit, enabled: false }));

    $scope.login = {
      userId: $location.search().userId,
      pin: ''
    };
    $scope.submitted = false;

    $scope.should = {
      showAlphanumericKeyboard: BooleanValue(PreferencesService.get('ShowAlphanumericKeypadOnPinPage'))
    };

    $scope.loginAndKeyboardWrapperClass = '';

    var keypadStyle = PreferencesService.get('AlphanumericKeypadStyle');
    $scope.keyboard = {
      layout: (keypadStyle === '2') ? 'QWERTY' : 'ALPHA',
      visible: false,
      inputField: 'pin-field',
      lowerCase: true,
      showHideButton: false
    };

    setPageText();
    startInactivityTimer();

    $scope.pinField = new InputField('pin-field', $scope.canSubmit, $scope.submit, { /*debounce: 250*/ });
    if (($scope.login.userId === undefined) || ($scope.login.userId === null) || ($scope.login.userId === '')) {
      $scope.showError($scope.pageText.missingUserIdParameter);
    } else {
      $scope.$watch('login.pin', function() {
        ButtonRowService.buttonRow.buttons[2].enabled = $scope.canSubmit();

        var maxUserPinLength = Number(PreferencesService.get('MaxUserPinLength'));
        if ((maxUserPinLength > 0) && ($scope.login.pin.length >= maxUserPinLength)) {
          $scope.submit();
        }

      });
    }

    $scope.$on('translations.received', function() {
      setPageText();
    });
  };
  init();
}]);
