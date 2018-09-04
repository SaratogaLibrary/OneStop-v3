// Copyright(c)2017-2018 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Menu',
[
	'ewOneStop-Users',
	'ewOneStop-Login',
	'ewOneStop-Rfid',
	'ewOneStop-Preferences',
	'ewOneStop-PrinterStatus',
	'ewOneStop-ButtonRow',
	'ewOneStop-PageLayout',
	'ewOneStop-Start',
	'ewOneStop-Dialogs',
	'ewOneStop-PageTimeout',
	'ewOneStop-Utilities',
	'ewOneStop-Languages'
])

.controller('MenuController',
[
  '$rootScope',
	'$scope',
  '$location',
	'$interval',
	'PreferencesService',
	'LanguagesService',
	'PrinterStatus',
	'StartService',
	'PageTimeoutService',
	'ButtonRowService',
	'PageLayoutService',
	'LoginService',
	'RfidService',
	'DialogService',
	'BooleanValue',
	'InputField',
function(	$rootScope,
					$scope,
					$location,
					$interval,
					PreferencesService,
					LanguagesService,
					PrinterStatus,
					StartService,
					PageTimeoutService,
					ButtonRowService,
					PageLayoutService,
					LoginService,
					RfidService,
					DialogService,
					BooleanValue,
					InputField) {
  'use strict';

	$scope.isCheckinAllowed = function() {
		return BooleanValue(PreferencesService.get('CheckinAllowed'));
	};

	$scope.isPrintReleaseAllowed = function() {
		return BooleanValue(PreferencesService.get('MenuShowPrintRelease'));
	};

	$scope.areReservationsAllowed = function() {
		return BooleanValue(PreferencesService.get('MenuShowMakeReservation'));
	};

	$scope.isFinesPaymentAllowed = function() {
		return BooleanValue(PreferencesService.get('MenuShowPayFines'));
	};

	$scope.isAccountManagementAllowed = function() {
		return BooleanValue(PreferencesService.get('MenuShowAccountManager'));
	};

	$scope.isCopyingAllowed = function() {
		return BooleanValue(PreferencesService.get('MenuShowMakeCopies'));
	};

	$scope.isMyAccountAllowed = function() {
		return BooleanValue(PreferencesService.get('MenuShowMyAccount'));
	};

	$scope.setNumButtons = function() {
		$scope.numButtons = 1;
		if ($scope.isCheckinAllowed()) {
			$scope.numButtons += 1;
		}

		if ($scope.isMyAccountAllowed()) {
			$scope.numButtons += 1;
		}

		if ($scope.isCopyingAllowed()) {
			$scope.numButtons += 1;
		}

		if ($scope.isPrintReleaseAllowed()) {
			$scope.numButtons += 1;
		}

		if ($scope.areReservationsAllowed()) {
			$scope.numButtons += 1;
		}

		if ($scope.isFinesPaymentAllowed()) {
			$scope.numButtons += 1;
		}

		if ($scope.isAccountManagementAllowed()) {
			$scope.numButtons += 1;
		}
	};

	$scope.setMenuWrapperClass = function() {
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
	};

	$scope.checkout = function() {
		PrinterStatus.check('Checkout')
		.then(function(status) {
			$location.search('printerStatus', status);
			$location.search('target', 'checkout');
			$location.path('login');
		})
		.catch(function() {
			// Either:
			// - the printer is down and checkout is disallowed
			// - the printer is down and the user choose to cancel
		});
	};

	$scope.checkin = function() {
		PrinterStatus.check('Checkin')
		.then(function() {
			$location.path('checkin');
		})
		.catch(function() {
			// Either:
			// - the printer is down and checkout is disallowed
			// - the printer is down and the user choose to cancel
		});
	};

	$scope.myAccount = function() {
		$location.search('target', 'myAccount');
		$location.path('login');
	};

	$scope.showError = function(errMsg) {
		if ($scope.login.inputField) {
			$scope.login.inputField.lockFocus = false;
		}
    DialogService.showError(errMsg)
    .then(function() {})
    .catch(function() {})
    .finally(function() {
			if ($scope.login.inputField) {
				$scope.login.inputField.lockFocus = true;
				$scope.login.inputField.focus();
			}
    });
	};

	$scope.submitUserId = function() {
		if ($scope.login.allowed && $scope.login.userId && !$scope.login.submitted) {
			$scope.login.submitted = true;

			// Cancel any input field updates that have not yet been processed
			if ($scope.loginForm && $scope.loginForm.$rollbackViewValue) {
				$scope.loginForm.$rollbackViewValue();
			}

			LoginService.login('checkout', $scope.login.userId)
			.then(function() {
				// LoginService handles all success cases
			})
			.catch(function(error) {
				$scope.login.userId = '';
				var errMsg = $scope.pageText.userNotFound;
				errMsg += '<br/><br/>(' + error.text + ')<br/>';
				$scope.showError(errMsg, $scope.pageText.userNotFoundHeader);
				$scope.login.submitted = false;
			});
		}
	};

	$scope.getRfidLibraryCard = function() {
		RfidService.getLibraryCard()
		.then(function(cardNumber) {
			if (cardNumber) {
				$scope.login.userId = cardNumber;
				$scope.submitUserId();
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
				$scope.$on('$destroy', $scope.disableRfid);
			})
			.catch(function() {
				// TODO: Decide whether the user should see an error if RFID cannot be enabled to read library cards
			});
		}
	};

	$scope.disableRfid = function() {
		if (rfidInterval) {
			$interval.cancel(rfidInterval);
			RfidService.disableRfid('statusSession');
		}
	};

	var setPageText = function() {
		$scope.pageText = {
			checkOutButton: LanguagesService.translate('MENU_CHECK_OUT_BUTTON'),
			checkInButton: LanguagesService.translate('MENU_CHECK_IN_BUTTON'),
			viewMyAccountButton: LanguagesService.translate('MENU_VIEW_MY_ACCOUNT_BUTTON'),
			makeCopiesButton: LanguagesService.translate('MENU_MAKE_COPIES_BUTTON'),
			releasePrintJobsButton: LanguagesService.translate('MENU_RELEASE_PRINT_JOBS_BUTTON'),
			reserveComputerButton: LanguagesService.translate('MENU_RESERVE_COMPUTER_BUTTON'),
			viewAndPayFinesButton: LanguagesService.translate('MENU_VIEW_AND_PAY_FINES_BUTTON'),
			depositMoneyButton: LanguagesService.translate('MENU_DEPOSIT_MONEY_BUTTON'),
			userNotFound: LanguagesService.translate('LOGIN_USER_NOT_FOUND'),
			userNotFoundHeader: LanguagesService.translate('LOGIN_USER_NOT_FOUND_HEADER')
		};
	};

  var init = function() {
		ButtonRowService.reset();
		$scope.setNumButtons();
		$scope.setMenuWrapperClass();

		$scope.copyPaymentManagerPath = PreferencesService.get('CopyPaymentManagerPath');
		$scope.reservationStationPath = PreferencesService.get('ReservationStationPath');
		$scope.accountManagerPath = PreferencesService.get('AccountManagerPath');
		$scope.eCommerceClientPath = PreferencesService.get('eCommerceClientPath');
		$scope.eCommerceServerAddress = PreferencesService.get('eCommerceServerAddress');
		$scope.eCommerceServerPort = PreferencesService.get('eCommerceServerPort');

		setPageText();

		$scope.login = {
			allowed: false,
			submitted: false,
			userId: ''
		};

		if (BooleanValue(PreferencesService.get('ActivateScannerOnMainMenu'))) {
			$scope.login.allowed = true;
			$scope.login.inputField = new InputField('user-id-field', undefined, $scope.submitUserId, { /*debounce: 250*/ });

			enableRfid();

			$scope.$watch('login.userId', function() {
	      var maxUserIdLength = Number(PreferencesService.get('MaxUserIdLength'));
	      if ((maxUserIdLength > 0) && ($scope.login.userId.length >= maxUserIdLength)) {
	        $scope.submitUserId();
	      }
	    });
		}

		$rootScope.$broadcast('headerImage.resume', {});

		$scope.$on('route.change', function(event, args) {
			var timeoutValue = Number(PreferencesService.get('PageTimeout'));
			if (!isNaN(timeoutValue) && (timeoutValue > 0) && !args.isInitialState) {
				PageTimeoutService.startInactivityTimer(timeoutValue);
			}
		});

		$scope.$on('translations.received', function() {
			setPageText();
		});
  };
  init();
}]);
