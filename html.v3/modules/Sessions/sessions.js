// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Sessions',
[
  'ewOneStop-Checkout',
  'ewOneStop-Checkin',
  'ewOneStop-Rfid',
  'ewOneStop-Defaults',
  'ewOneStop-Utilities',
  'ewOneStop-Sounds',
  'ewOneStop-Preferences'
])

.factory('Session',
[
  'Defaults',
  'BooleanValue',
  'ObjectProperty',
function(Defaults, BooleanValue, ObjectProperty) {
  'use strict';

  var getProperty = ObjectProperty;

  var Session = function(data) {
    this.userId = getProperty(data, 'userId', '');
    this.loggedIn = getProperty(data, 'loggedIn', 'No');
    this.numberOfItemsProcessed = Number(getProperty(data, 'numberOfItemsProcessed', 0));
    this.numberOfCheckedOutItems = Number(getProperty(data, 'numberOfCheckedOutItems', 0));
    this.numberOfCheckedInItems = Number(getProperty(data, 'numberOfCheckedInItems', 0));
    this.defaultLanguageCode = getProperty(data, 'defaultLanguageCode', Defaults.LANGUAGE_CODE);
    this.currentLanguageCode = getProperty(data, 'currentLanguageCode', Defaults.LANGUAGE_CODE);
    this.numberOfRenewedItems = Number(getProperty(data, 'numberOfRenewedItems', 0));
    this.numberOfStandardCheckedOutItems = Number(getProperty(data, 'numberOfStandardCheckedOutItems', 0));
    this.numberOfStandardCheckedInItems = Number(getProperty(data, 'numberOfStandardCheckedInItems', 0));
    this.numberOfHoldItems = Number(getProperty(data, 'numberOfHoldItems', 0));
    this.numberOfTransitItems = Number(getProperty(data, 'numberOfTransitItems', 0));
    this.numberOfCheckoutErrors = Number(getProperty(data, 'numberOfCheckoutErrors', 0));
    this.numberOfCheckinErrors = Number(getProperty(data, 'numberOfCheckinErrors', 0));
    this.numberOfExistingItemsOut = Number(getProperty(data, 'numberOfExistingItemsOut', 0));
    this.totalItemsCirculated = Number(getProperty(data, 'totalItemsCirculated', 0));
    this.totalItemsOut = Number(getProperty(data, 'totalItemsOut', 0));
    this.printerStatus = Number(getProperty(data, 'printerStatus', 0));
    this.ilsOffline = getProperty(data, 'ilsOffline', 0);
    this.renewedItems = getProperty(data, 'renewedItems', []);
    this.checkedOutItems = getProperty(data, 'checkedOutItems', []);
    this.existingItemsOut = getProperty(data, 'existingItemsOut', []);
    this.checkedInItems = getProperty(data, 'checkedInItems', []);
    this.holdItems = getProperty(data, 'holdItems', []);
    this.transitItems = getProperty(data, 'transitItems', []);
    this.checkoutErrorItems = getProperty(data, 'checkoutErrorItems', []);
    this.checkinErrorItems = getProperty(data, 'checkinErrorItems', []);
    this.checkoutItemsPendingSecurityAdjustment = getProperty(data, 'checkoutItemsPendingSecurityAdjustment', []);
    this.checkinItemsPendingSecurityAdjustment = getProperty(data, 'checkinItemsPendingSecurityAdjustment', []);
    this.savedRecommendations = getProperty(data, 'savedRecommendations', []);
    this.paidFines = getProperty(data, 'paidFines', []);
    this.pendingAlerts = getProperty(data, 'pendingAlerts', {});
    this.pendingAlerts.ilsOffline = Number(this.pendingAlerts.ilsOffline) || 0;
    this.pendingAlerts.ilsOfflineClaimed = Number(this.pendingAlerts.ilsOfflineClaimed) || 0;
    this.pendingAlerts.printerDown = Number(this.pendingAlerts.printerDown) || 0;
    this.pendingAlerts.printerDownClaimed = Number(this.pendingAlerts.printerDownClaimed) || 0;
    this.pendingAlerts.helpRequest = Number(this.pendingAlerts.helpRequest) || 0;
    this.pendingAlerts.helpRequestClaimed = Number(this.pendingAlerts.helpRequestClaimed) || 0;
  };

  Session.prototype.isLoggedIn = function() { return BooleanValue(this.loggedIn); };
  Session.prototype.isPrinterReady = function() { return this.printerStatus === 0; };
  Session.prototype.isIlsOffline = function() { return BooleanValue(this.ilsOffline); };
  Session.prototype.isIlsOfflineAlertPending = function() { return BooleanValue(this.pendingAlerts.ilsOffline); };
  Session.prototype.isIlsOfflineAlertClaimed = function() { return BooleanValue(this.pendingAlerts.ilsOfflineClaimed); };
  Session.prototype.isPrinterDownAlertPending = function() { return BooleanValue(this.pendingAlerts.printerDown); };
  Session.prototype.isPrinterDownAlertClaimed = function() { return BooleanValue(this.pendingAlerts.printerDownClaimed); };
  Session.prototype.isHelpRequestPending = function() { return BooleanValue(this.pendingAlerts.helpRequest); };
  Session.prototype.isHelpRequestClaimed = function() { return BooleanValue(this.pendingAlerts.helpRequestClaimed); };

  Session.create = function(data) {
    return new Session(data);
  };

  return Session;
}])

.factory('SessionsService',
[
  '$http',
  '$q',
  'RfidService',
  'Session',
function($http, $q, RfidService, Session) {
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

  var reset = function() {
    return performAction({
              action: 'resetSession',
              nextPage: 'schemas/statusSession.json',
              errorPage: 'schemas/error.json'
            });
  };

  var refresh = function(action) {
    return performAction({
              action: 'refresh',
              contentTemplate: 'schemas/' + action + 'Session.json'
            });
  };

  var enableRfid = function(action) {
    return RfidService.enableRfid(action, action + 'Session')
                      .then(function(schemaData) {
                        return $q.when(Session.create(schemaData));
                      });
  };

  var enableRfidCheckout = function() {
    return enableRfid('checkout');
  };

  var enabledRfidCheckin = function() {
    return enableRfid('checkin');
  };

  var disableRfid = function(action) {
    return RfidService.disableRfid(action + 'Session')
            .then(function(schemaData) {
              return $q.when(Session.create(schemaData));
            });
  };

  var startCheckinSession = function() {
    return performAction({
              action: 'startCheckinSession',
              nextPage: 'schemas/checkinSession.json',
              errorPage: 'schemas/error.json'
            });
  };

  var saveRecommendation = function(isbn) {
    return performAction({
              action: 'saveRecommendation',
              isbn: isbn,
              nextPage: 'schemas/checkoutSession.json',
              errorPage: 'schemas/error.json'
            });
  };

  return {
    reset: reset,
    refresh: refresh,
    enableRfidCheckout: enableRfidCheckout,
    enableRfidCheckin: enabledRfidCheckin,
    disableRfid: disableRfid,
    startCheckinSession: startCheckinSession,
    saveRecommendation: saveRecommendation
  };
}]);
