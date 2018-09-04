// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Preferences',
[

])

.factory('PreferencesService',
[
function() {
  'use strict';

  var preferences = {
    /* RFID */
    'RFIDLinkServerPortNumber': '%%Preferences.RFIDLink:ServerPortNumber%%',
    'RFIDPollingInterval': '%%Preferences.RFID:PollingInterval%%',
    'RFIDTimeout': '%%Preferences.RFID:Timeout%%',
    'UseRfid': '%%Preferences.UseRfid%%',                                                   // USEFUL
    'UseRfidLibraryCards': '%%Preferences.UseRfidLibraryCards%%',                                 // NEW

    /* ILS */
    /* Note: Login-related preferences are omitted */
    'IlsServerAddress': '%%Preferences.IlsServerAddress%%',
    'IlsServerPort': '%%Preferences.IlsServerPort%%',
    'IlsChecksumEnabled': '%%Preferences.IlsChecksumEnabled%%',
    'IlsKeepAliveInterval': '%%Preferences.IlsKeepAliveInterval%%',
    'IlsRequireUserPin': '%%Preferences.IlsRequireUserPin%%',                               // USEFUL
    'IlsConnectionType': '%%Preferences.IlsConnectionType%%',
    'IlsTimeout': '%%Preferences.IlsTimeout%%',
    'IlsLocationCode': '%%Preferences.IlsLocationCode%%',
    'IlsSIPEncoding': '%%Preferences.IlsSIPEncoding%%',
    'IlsTerminalLocation': '%%Preferences.IlsTerminalLocation%%',

    /* My Account */
    'MyAccountShowIlsStatus': '%%Preferences.MyAccount:ShowIlsStatus%%',                    // USEFUL
    'MyAccountShowUserAddress': '%%Preferences.MyAccount:ShowUserAddress%%',                // USEFUL
    'MyAccountAllowUserToViewChargedItems': '%%Preferences.MyAccount:AllowUserToViewChargedItems%%',   // USEFUL
    'MyAccountAllowUserToViewFineItems': '%%Preferences.MyAccount:AllowUserToViewFineItems%%',  // USEFUL
    'MyAccountAllowUserToViewHoldItems': '%%Preferences.MyAccount:AllowUserToViewHoldItems%%',  // USEFUL
    'MyAccountAllowUserToViewOverdueItems': '%%Preferences.MyAccount:AllowUserToViewOverdueItems%%',  // USEFUL
    'MyAccountAllowUserToRenewChargedItems': '%%Preferences.MyAccount:AllowUserToRenewChargedItems%%',  // USEFUL
    'MyAccountAllowUserToPrintSummary': '%%Preferences.MyAccount:AllowUserToPrintSummary%%',    // USEFUL
    'MyAccountDisplayOnlyWhenPatronIsBlocked': '%%Preferences.MyAccount:DisplayOnlyWhenPatronIsBlocked%%',  // USEFUL
    'MyAccountProcessRenewalsAsCheckouts': '%%Preferences.MyAccount:ProcessRenewalsAsCheckouts%%',  // USEFUL

    /* Check Out */
    'CheckoutCannotDesensitizePage': '%%Preferences.CheckoutCannotDesensitizePage%%',
    'CheckoutDesensitizeFailedPage': '%%Preferences.CheckoutDesensitizeFailedPage%%',
    'CheckoutDuplicateItemPage': '%%Preferences.CheckoutDuplicateItemPage%%',
    'CheckoutErrorPage': '%%Preferences.CheckoutErrorPage%%',
    'CheckoutHideItemIdField': '%%Preferences.CheckoutHideItemIdField%%',                   // USEFUL
    'CheckoutNextPage': '%%Preferences.CheckoutNextPage%%',
    'CheckoutShowUserName': '%%Preferences.CheckoutShowUserName%%',                         // USEFUL
    'CheckoutAllowCheckoutWhenPrinterDown': '%%Preferences.Checkout:AllowCheckoutWhenPrinterDown%%',  // USEFUL
    'CheckoutProcessIncompleteSets': '%%Preferences.Checkout:ProcessIncompleteSets%%',
    'CheckoutAlwaysShowMyAccountPage': '%%Preferences.Checkout:AlwaysShowMyAccountPage%%',  // USEFUL
    'CheckoutPrintReceipt': '%%Preferences.Checkout:PrintReceipt%%',                        // USEFUL
    'CheckoutForceReceiptForMediaTypes': '%%Preferences.Checkout:ForceReceiptForMediaTypes%%',  // POSSIBLY USEFUL
    'CheckoutShowExistingItemsOnReceipt': '%%Preferences.Checkout:ShowExistingItemsOnReceipt%%',  // POSSIBLY USEFUL
    'CheckoutColumnTitle': '%%Preferences.Checkout:ColumnTitle%%',                          // USEFUL
    'CheckoutColumnItemId': '%%Preferences.Checkout:ColumnItemId%%',                        // USEFUL
    'CheckoutColumnDueDate': '%%Preferences.Checkout:ColumnDueDate%%',                      // USEFUL
    'CheckoutColumnStatus': '%%Preferences.Checkout:ColumnStatus%%',                        // USEFUL
    'CheckoutAllowItemIdEntryBeforeEMTagIsDetected': '%%Preferences.Checkout:AllowItemIdEntryBeforeEMTagIsDetected%%',
    'CheckoutSendEmailReceipt': '%%Preferences.Checkout:SendEmailReceipt%%',                // USEFUL
    'CheckoutDisplayFailureNotificationsForBarcodeCheckOut': '%%Preferences.Checkout:DisplayFailureNotificationsForBarcodeCheckOut%%',  // USEFUL
    'CheckoutDisplayFailureNotificationsForBarcodeCheckout': '%%Preferences.Checkout:DisplayFailureNotificationsForBarcodeCheckOut%%',  // ALIAS due to inconsistent casing of Checkout
    'CheckoutScreenPortlet': '%%Preferences.CheckOutScreen:Portlet%%',                      // POSSIBLY USEFUL
    'CheckOutScreenPortlet': '%%Preferences.CheckOutScreen:Portlet%%',                      // ALIAS
    'CheckoutScreenShowOtherOptionsButton': '%%Preferences.CheckOutScreen:ShowOtherOptionsButton%%',    // POSSIBLY USEFUL
    'CheckOutScreenShowOtherOptionsButton': '%%Preferences.CheckOutScreen:ShowOtherOptionsButton%%',    // ALIAS
    'CheckoutRfSecurityReceiptEnabled': '%%Preferences.Checkout:RfSecurityReceiptEnabled%%',
    'CheckoutRfSecurityReceiptTemplate': '%%Preferences.Checkout:RfSecurityReceiptTemplate%%',
    'CheckoutRfSecurityReceiptNotificationTimeout': '%%Preferences.Checkout:RfSecurityReceiptNotificationTimeout%%',
    'CheckoutIncludeSip2ScreenMessageOnReceipt': '%%Preferences.CheckoutIncludeSip2ScreenMessageOnReceipt%%',
    'CheckoutIncludeSip2PrintLineOnReceipt': '%%Preferences.CheckoutIncludeSip2PrintLineOnReceipt%%',
    'IgnoreMagneticMediaFlagWhenDesensitizing': '%%Preferences.IgnoreMagneticMediaFlagWhenDesensitizing%%',
    'UseDesensitizer': '%%Preferences.UseDesensitizer%%',

    /* Check In */
    'CheckinAllowed': '%%Preferences.CheckinAllowed%%',                                     // USEFUL
    'CheckinCannotResensitizePage': '%%Preferences.CheckinCannotResensitizePage%%',
    'CheckinDuplicateItemPage': '%%Preferences.CheckinDuplicateItemPage%%',
    'CheckinErrorPage': '%%Preferences.CheckinErrorPage%%',
    'CheckinHideItemIdField': '%%Preferences.CheckinHideItemIdField%%',                     // USEFUL
    'CheckinIlsUnavailablePage': '%%Preferences.CheckinIlsUnavailablePage%%',
    'CheckinNextPage': '%%Preferences.CheckinNextPage%%',
    'CheckinResensitizeFailedPage': '%%Preferences.CheckinResensitizeFailedPage%%',
    'CheckinAllowCheckinWhenPrinterDown': '%%Preferences.Checkin:AllowCheckinWhenPrinterDown%%',   // USEFUL
    'CheckinProcessIncompleteSets': '%%Preferences.Checkin:ProcessIncompleteSets%%',
    'CheckinPrintReceipt': '%%Preferences.Checkin:PrintReceipt%%',                          // USEFUL
    'CheckinSendEmailReceipt': '%%Preferences.Checkin:SendEmailReceipt%%',                  // USEFUL
    'CheckinColumnTitle': '%%Preferences.Checkin:ColumnTitle%%',                            // USEFUL
    'CheckinColumnItemId': '%%Preferences.Checkin:ColumnItemId%%',                          // USEFUL
    'CheckinColumnStatus': '%%Preferences.Checkin:ColumnStatus%%',                          // USEFUL
    'CheckinColumnDestinationLocation': '%%Preferences.Checkin:ColumnDestinationLocation%%',
    'CheckinAllowItemIdEntryBeforeEMTagIsDetected': '%%Preferences.Checkin:AllowItemIdEntryBeforeEMTagIsDetected%%',
    'CheckinDisplayFailureNotificationsForBarcodeCheckIn': '%%Preferences.Checkin:DisplayFailureNotificationsForBarcodeCheckIn%%',  // NEW
    'CheckinDisplayFailureNotificationsForBarcodeCheckin': '%%Preferences.Checkin:DisplayFailureNotificationsForBarcodeCheckIn%%',  // ALIAS due to inconsistent casing of Checkin
    'IgnoreMagneticMediaFlagWhenResensitizing': '%%Preferences.IgnoreMagneticMediaFlagWhenResensitizing%%',
    'PreventDuplicateCheckins': '%%Preferences.PreventDuplicateCheckins%%',
    'UseResensitizer': '%%Preferences.UseResensitizer%%',

    /* Intelligent Returns */
    'IntelligentReturnsAutoHoldSlipPrinting': '%%Preferences.IntelligentReturnsAutoHoldSlipPrinting%%',
    'IntelligentReturnsAutoHoldSlipNamePrefix': '%%Preferences.IntelligentReturnsAutoHoldSlipNamePrefix%%',
    'IntelligentReturnsMode': '%%Preferences.IntelligentReturnsMode%%',
    'IntelligentReturnsPollingInterval': '%%Preferences.IntelligentReturnsPollingInterval%%',
    'IntelligentReturnsIgnoreDuplicateCheckins': '%%Preferences.IntelligentReturnsIgnoreDuplicateCheckins%%',

    /* Barcode */
    'ActivateScannerOnMainMenu': '%%Preferences.ActivateScannerOnMainMenu%%',               // USEFUL
    'BarcodeInputFilters': '%%Preferences.BarcodeInputFilters%%',                           // POSSIBLY USEFUL

    /* Runtime Environment */
    'AllowContextMenu': '%%Preferences.AllowContextMenu%%',                                 // USEFUL
    'BrowserStartUpDelay': '%%Preferences.BrowserStartUpDelay%%',
    'MainPage': '%%Preferences.MainPage%%',
    'MaxUserIdLength': '%%Preferences.MaxUserIdLength%%',                                   // POSSIBLY USEFUL
    'MaxUserPinLength': '%%Preferences.MaxUserPinLength%%',                                 // POSSIBLY USEFUL
    'StripWhiteSpaceFromUserId': '%%Preferences.StripWhiteSpaceFromUserId%%',               // POSSIBLY USEFUL
    'StripWhiteSpaceFromItemId': '%%Preferences.StripWhiteSpaceFromItemId%%',               // POSSIBLY USEFUL
    'PageTimeout': '%%Preferences.PageTimeout%%',                                           // USEFUL,
    'PageLongTimeout': '%%Preferences.PageLongTimeout%%',
    'ReportPrinterName': '%%Preferences.ReportPrinterName%%',
    'RequirePasswordToExit': '%%Preferences.RequirePasswordToExit%%',
    'RunFullScreen': '%%Preferences.RunFullScreen%%',
    'RunOnPrivateDesktop': '%%Preferences.RunOnPrivateDesktop%%',
    'StaffUserId': '%%Preferences.StaffUserId%%',
    'UseDemoMode': '%%Preferences.UseDemoMode%%',
    'WebServerDocumentRoot': '%%Preferences.WebServerDocumentRoot%%',
    'WebServerPort': '%%Preferences.WebServerPort%%',

    /* Keypad */
    'AlphanumericKeypadStyle': '%%Preferences.AlphanumericKeypadStyle%%',                 // USEFUL
    'Keyboard1': '%%Preferences.Keyboard1%%',
    'Keyboard2': '%%Preferences.Keyboard2%%',
    'ShowAlphanumericKeypadOnPinPage': '%%Preferences.ShowAlphanumericKeypadOnPinPage%%',   // USEFUL
    'ShowAlphanumericKeypadOnUserIdPage': '%%Preferences.ShowAlphanumericKeypadOnUserIdPage%%', // USEFUL
    'ShowKeypadOnUserIdPage': '%%Preferences.ShowKeypadOnUserIdPage%%',                     // USEFUL

    /* External Applications */
    'AccountManagerPath': '%%Preferences.AccountManagerPath%%',                             // USEFUL
    'eCommerceClientPath': '%%Preferences.eCommerceClientPath%%',                           // USEFUL
    'PrtPath': '%%Preferences.PrtPath%%',                                                   // USEFUL
    'ReservationStationPath': '%%Preferences.ReservationStationPath%%',                     // USEFUL
    'CopyPaymentManagerPath': '%%Preferences.CopyPaymentManagerPath%%',             // NEW
    'MenuShowAccountManager': '%%Preferences.MenuShowAccountManager%%',                     // USEFUL
    'MenuShowMyAccount': '%%Preferences.MenuShowMyAccount%%',                       // NEW
    'MenuShowMakeReservation': '%%Preferences.MenuShowMakeReservation%%',                   // USEFUL
    'MenuShowPayFines': '%%Preferences.MenuShowPayFines%%',                                 // USEFUL
    'MenuShowPrintRelease': '%%Preferences.MenuShowPrintRelease%%',                         // USEFUL
    'MenuShowMakeCopies': '%%Preferences.MenuShowMakeCopies%%',                     // NEW
    'MenuShowStaffFunctions': '%%Preferences.MenuShowStaffFunctions%%',                     // USEFUL
    'PayFinesAllowed': '%%Preferences.PayFinesAllowed%%',                                   // USEFUL

    /* System Monitor */
    'SystemMonitorPort': '%%Preferences.SystemMonitor:Port%%',

    /* Branch Manager */
    'BranchManagerEnableHelpRequest': '%%Preferences.BranchManager:EnableHelpRequest%%',    // USEFUL
    'BranchManagerServerIpAddress': '%%Preferences.BranchManager:ServerIpAddress%%',
    'BranchManagerServerPort': '%%Preferences.BranchManager:ServerPort%%',
    'BranchManagerSocketReceiveTimeout': '%%Preferences.BranchManager:SocketReceiveTimeout%%',
    'BranchManagerSource': '%%Preferences.BranchManager:Source%%',
    'EmailReceiptsFormat': '%%Preferences.EmailReceipts:Format%%',                          // USEFUL

    /* Central History */
    /* Note: Login-related preferences are omitted */
    'CentralHistoryDatabaseHostName': '%%Preferences.CentralHistory:DatabaseHostName%%',
    'CentralHistoryDatabasePort': '%%Preferences.CentralHistory:DatabasePort%%',
    'CentralHistoryEnabled': '%%Preferences.CentralHistory:Enabled%%',
    'CentralHistoryOneStopName': '%%Preferences.CentralHistory:OneStopName%%',
    'CentralHistoryLocationBranchName': '%%Preferences.CentralHistory:Location/BranchName%%',
    'CentralHistorySystemName': '%%Preferences.CentralHistory:SystemName%%',

    /* eCommerce */
    'eCommerceServerAddress': '%%Preferences.eCommerceServerAddress%%',                     // POSSIBLY USEFUL
    'eCommerceServerPort': '%%Preferences.eCommerceServerPort%%',                           // POSSIBLY USEFUL

    /* JQE */
    'JqeHostAddress': '%%Preferences.JqeHostAddress%%',                                     // POSSIBLY USEFUL
    'JqeHostPort': '%%Preferences.JqeHostPort%%',                                           // POSSIBLY USEFUL

    /* Localization */
    'DateFormat': '%%Preferences.DateFormat%%',                                             // POSSIBLY USEFUL
    'DefaultLanguageCode': '%%Preferences.DefaultLanguageCode%%',                           // POSSIBLY USEFUL
    'ShowLanguagesOnAllPages': '%%Preferences.ShowLanguagesOnAllPages%%',                   // USEFUL
    'SupportedLanguages': '%%Preferences.SupportedLanguages%%',                             // USEFUL
    'CurrencySymbol': '%%Preferences.CurrencySymbol%%',
    /* Kiosk Hardware */
    'KioskHardwareDeviceId': '%%Preferences.KioskHardwareDeviceId%%',
    'KioskHardwareMonitoringInterval': '%%Preferences.KioskHardwareMonitoringInterval%%',
    'KioskHardwareVIMPort': '%%Preferences.KioskHardwareVIMPort%%',
    'UseKioskHardware': '%%Preferences.UseKioskHardware%%',

    /* Logging */
    'LogCirculationActivity': '%%Preferences.LogCirculationActivity%%',
    'LogVendingActivity': '%%Preferences.LogVendingActivity%%',
    'LoggingEnabled': '%%Preferences.Logging:Enabled%%',
    'LoggingLogHtml': '%%Preferences.Logging:LogHtml%%',
    'LoggingMaximumFileSizeInMB': '%%Preferences.Logging:MaximumFileSizeInMB%%',
    'LoggingMaximumNumberOfBackups': '%%Preferences.Logging:MaximumNumberOfBackups%%',

    /* Receipts */
    'MaxItemsPerReceipt': '%%Preferences.MaxItemsPerReceipt%%',
    'ReceiptPrintAsImage': '%%Preferences.Receipt:PrintAsImage%%',
    'ReceiptPrinterName': '%%Preferences.ReceiptPrinterName%%',
    'ReceiptPrinterSendStatusAlert': '%%Preferences.ReceiptPrinter:SendStatusAlert%%',
    'ReceiptPrinterShowStatus': '%%Preferences.ReceiptPrinter:ShowStatus%%',                  // USEFUL

    /* Offline Transactions */
    'OfflineTransactionsDefaultDueDays': '%%Preferences.OfflineTransactions:DefaultDueDays%%',
    'OfflineTransactionsMode': '%%Preferences.OfflineTransactions:Mode%%',
    'OfflineTransactionsSendOfflineAlert': '%%Preferences.OfflineTransactions:SendOfflineAlert%%',
    'OfflineTransactionsStableTimeBeforeReturningToOnlineMode': '%%Preferences.OfflineTransactions:StableTimeBeforeReturningToOnlineMode%%',
    'OfflineTransactionsStoreFileName': '%%Preferences.OfflineTransactions:StoreFileName%%',

    /* Novelist */
    'NovelistEnabled': '%%Preferences.Novelist:Enabled%%',                                  // USEFUL
    'NovelistLimitToLocallyHeld': '%%Preferences.Novelist:LimitToLocallyHeld%%',
    'NovelistIncludeSeriesInfo': '%%Preferences.Novelist:IncludeSeriesInfo%%',
    'NovelistInclideSimilarTitles': '%%Preferences.Novelist:IncludeSimilarTitles%%',
    'NovelistRecommendationsPerTitleLimit': '%%Preferences.Novelist:RecommendationsPerTitleLimit%%',
    'NovelistUiUpdateInterval': '%%Preferences.Novelist:UiUpdateInterval%%',                // USEFUL
    'NovelistInitialCheckInterval': '%%Preferences.Novelist:InitialCheckInterval%%',     // NEW
    'NovelistAllowUserToPlaceHold': '%%Preferences.Novelist:AllowUserToPlaceHold%%',    // NEW
    'NovelistHoldRequestItemIdType': '%%Preferences.Novelist:HoldRequestItemIdType%%',  // NEW
    'NovelistHoldConfirmationShowTitle': '%%Preferences.Novelist:HoldConfirmationShowTitle%%',  // NEW
    'NovelistHoldConfirmationShowExpirationDate': '%%Preferences.Novelist:HoldConfirmationShowExpirationDate%%',  // NEW
    'NovelistHoldConfirmationShowQueuePosition': '%%Preferences.Novelist:HoldConfirmationShowQueuePosition%%',  // NEW
    'NovelistHoldConfirmationShowPickupLocation': '%%Preferences.Novelist:HoldConfirmationShowPickupLocation%%',  // NEW
    'NovelistUseDemoMode': '%%Preferences.Novelist:UseDemoMode%%',    // NEW but not included in distributed EWP

    /* Color and Style */                                                                   // POSSIBLY USEFUL
    'GUI2_0BackgroundColor': '%%Preferences.GUI2.0:BackgroundColor%%',
    'GUI2_0ButtonColor': '%%Preferences.GUI2.0:ButtonColor%%',
    'GUI2_0ActiveButtonColor': '%%Preferences.GUI2.0:ActiveButtonColor%%',
    'GUI2_0ButtonBorderColor': '%%Preferences.GUI2.0:ButtonBorderColor%%',
    'GUI2_0AccentColor': '%%Preferences.GUI2.0:AccentColor%%',
    'GUI2_0FontFace': '%%Preferences.GUI2.0:FontFace%%',
    'GUI2_0FontColor': '%%Preferences.GUI2.0:FontColor%%',
    'GUI2_0PageHeaderColor': '%%Preferences.GUI2.0:PageHeaderColor%%',
    'GUI2_0TableEvenRowColor': '%%Preferences.GUI2.0:TableEvenRowColor%%',
    'GUI2_0TableOddRowColor': '%%Preferences.GUI2.0:TableOddRowColor%%',
    'GUI2_0ImportantMessageColor': '%%Preferences.GUI2.0:ImportantMessageColor%%',
    'PageAccentColor': '%%Preferences.PageAccentColor%%',
    'PageBackgroundColor': '%%Preferences.PageBackgroundColor%%',
    'PageElementBorderColor': '%%Preferences.PageElementBorderColor%%',
    'PageErrorSoundFile': '%%Preferences.PageErrorSoundFile%%',
    'PageFillColor': '%%Preferences.PageFillColor%%',
    'PageGradientStartColor': '%%Preferences.PageGradientStartColor%%',
    'PageGradientEndColor': '%%Preferences.PageGradientEndColor%%',
    'PageImportantMessageColor': '%%Preferences.PageImportantMessageColor%%',
    'PageLogoFile': '%%Preferences.PageLogoFile%%',
    'PageMenuLinkColor': '%%Preferences.PageMenuLinkColor%%',
    'PageTableEvenRowColor': '%%Preferences.PageTableEvenRowColor%%',
    'PageTableOddRowColor': '%%Preferences.PageTableOddRowColor%%',
    'PageTextColor': '%%Preferences.PageTextColor%%',
    'PageTextFontFace': '%%Preferences.PageTextFontFace%%',
    'ThemeCalloutImagePath': '%%Preferences.Theme:CalloutImagePath%%',                // NEW
    'ThemeHeaderImages': '%%Preferences.Theme:HeaderImages%%',                        // NEW
    'ThemeHeaderImageRotationInterval': '%%Preferences.Theme:HeaderImageRotationInterval%%',  // NEW
    'ThemeImportantMessageColor': '%%Preferences.Theme:ImportantMessageColor%%',
    'ThemeLogoImagePath': '%%Preferences.Theme:LogoImagePath%%',                      // NEW
    'ThemeLogoImageBackground': '%%Preferences.Theme:LogoImageBackground%%',          // NEW - 'opaque' or 'transparent'
    'ThemeMenuButtonColor': '%%Preferences.Theme:MenuButtonColor%%',                  // NEW
    'ThemeMenuButtonStyle': '%%Preferences.Theme:MenuButtonStyle%%',                  // NEW - 'color' or 'white'
    'ThemeName': '%%Preferences.Theme:Name%%',                                        // NEW
    'ThemeRSSFeedUrl': '%%Preferences.Theme:RSSFeedUrl%%',                            // NEW
    'ThemeShowCalloutImage': '%%Preferences.Theme:ShowCalloutImage%%',                // NEW
    'ThemeShowRSSFeed': '%%Preferences.Theme:ShowRSSFeed%%',                          // NEW
    'InitialState': '%%Preferences.InitialState%%',                                   // NEW
    'ThemeLogoDisplayStyle': '%%Preferences.Theme:LogoDisplayStyle%%',                          // NEW
    'ThemePageTitleHeaderDisplayStyle': '%%Preferences.Theme:PageTitleHeaderDisplayStyle%%',    // NEW

    // Hardware
    'HardwareModel': '%%Preferences.Hardware:Model%%',                                // NEW ('X11' or anything else; controls which animations are shown)
    'HardwareCaseControllerAttached': '%%Preferences.Hardware:CaseControllerAttached%%',  // NEW (controls which animations are shown)

    // Sounds
    'SoundsEnabled': '%%Preferences.Sounds:Enabled%%',                                            // NEW
    'SoundsErrorSound': '%%Preferences.Sounds:ErrorSound%%',                                      // NEW
    'SoundsSuccessSound': '%%Preferences.Sounds:SuccessSound%%'                                   // NEW
  };

  var get = function(key, defaultValue) {
    if (preferences.hasOwnProperty(key)) {
      return preferences[key];
    }
    return defaultValue;
  };

  var set = function(key, value) {
    if (preferences.hasOwnProperty(key)) {
      preferences[key] = value;
    } else {
      throw new Error(key + ' is not a valid preference name');
    }
  };

  return {
    get: get,
    set: set
  };
}]);
