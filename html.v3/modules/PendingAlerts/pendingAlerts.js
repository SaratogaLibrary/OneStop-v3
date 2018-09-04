// Copyright(c)2017-2018 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-PendingAlerts',
[
  'ewOneStop-Sessions',
  'ewOneStop-HelpRequests',
  'ewOneStop-Dialogs',
  'ewOneStop-Languages'
])

.factory('PendingAlertsService',
[
  '$http',
  '$q',
  'Session',
function($http, $q, Session) {
  'use strict';

  var claimAlert = function(which) {
    var options = {
      method: 'GET',
      url: '/selfCheck',
      params: {
        action: 'pendAlert',
        nextPage: 'schemas/statusSession.json',
        errorPage: 'schemas/error.json'
      }
    };
    options.params[which] = '1';
    return $http(options)
            .then(function(response) {
              if (response.data.code) {
                return $q.reject(response.data);
              }
              return $q.when(Session.create(response.data));
            }, function(error) {
              return $q.reject({ code: error.status, text: error.message || error.data });
            });
  };

  var claimIlsOfflineAlert = function() {
    return claimAlert('ilsOffline');
  };

  var claimPrinterDownAlert = function() {
    return claimAlert('printerDown');
  };

  var claimHelpRequest = function() {
    return claimAlert('requestHelp');
  };

  return {
    claimIlsOfflineAlert: claimIlsOfflineAlert,
    claimPrinterDownAlert: claimPrinterDownAlert,
    claimHelpRequest: claimHelpRequest
  };
}])

.controller('PendingAlertsController',
[
  '$scope',
  '$location',
  'PendingAlertsService',
  'SessionsService',
  'LanguagesService',
  'HelpRequestsService',
  'DialogService',
function($scope, $location, PendingAlertsService, SessionsService, LanguagesService, HelpRequestsService, DialogService) {
  'use strict';

  $scope.claimIlsOfflineAlert = function() {
    claimAlert(PendingAlertsService.claimIlsOfflineAlert);
  };

  $scope.claimPrinterDownAlert = function() {
    claimAlert(PendingAlertsService.claimPrinterDownAlert);
  };

  $scope.claimHelpRequest = function() {
    PendingAlertsService.claimHelpRequest()
    .then(function(status) {
      updateState(status);
      if (!$scope.has.unclaimedHelpRequest) {
        HelpRequestsService.clearPendingHelpRequest();
      }
    })
    .catch(function(error) {
      DialogService.showError(error.text, $scope.pageText.failedToClaimHelpRequestHeader);
    });
  };

  $scope.returnToStaffMenu = function() {
    $location.path('staffMenu');
  };

  var claimAlert = function(claimFn) {
    claimFn().then(function(status) {
      updateState(status);
    })
    .catch(function(error) {
      DialogService.showError(error.text, $scope.pageText.failedToClaimAlertHeader);
    });
  };

  var updateState = function(status) {
    $scope.has.unclaimedIlsOfflineAlert = !!(status.pendingAlerts.ilsOffline && !status.pendingAlerts.ilsOfflineClaimed);
    $scope.has.unclaimedPrinterDownAlert = !!(status.pendingAlerts.printerDown && !status.pendingAlerts.printerDownClaimed);
    $scope.has.unclaimedHelpRequest = !!(status.pendingAlerts.helpRequest && !status.pendingAlerts.helpRequestClaimed);
  };

  var setPageText = function() {
    $scope.pageText = {
      noPendingAlerts: LanguagesService.translate('PENDING_ALERTS_NO_PENDING_ALERTS'),
      claimOfflineAlertButton: LanguagesService.translate('PENDING_ALERTS_CLAIM_OFFLINE_ALERT_BUTTON'),
      claimPrinterDownAlertButton: LanguagesService.translate('PENDING_ALERTS_CLAIM_PRINTER_DOWN_ALERT_BUTTON'),
      claimHelpRequestButton: LanguagesService.translate('PENDING_ALERTS_CLAIM_HELP_REQUEST_BUTTON'),
      returnToStaffMenuButton: LanguagesService.translate('PENDING_ALERTS_RETURN_TO_STAFF_MENU_BUTTON'),
      failedToGetUnclaimedAlertsHeader: LanguagesService.translate('PENDING_ALERTS_FAILED_TO_GET_UNCLAIMED_ALERTS_HEADER'),
      failedToClaimAlertHeader: LanguagesService.translate('PENDING_ALERTS_FAILED_TO_CLAIM_ALERT_HEADER'),
      failedToClaimHelpRequestHeader: LanguagesService.translate('PENDING_ALERTS_FAILED_TO_CLAIM_HELP_REQUEST_HEADER')
    };
  };

  var init = function() {
    setPageText();

    $scope.has = {
      unclaimedIlsOfflineAlert: false,
      unclaimedPrinterDownAlert: false,
      unclaimedHelpRequest: false
    };

    SessionsService.refresh('status')
    .then(function(status) {
      updateState(status);
    })
    .catch(function(error) {
      DialogService.showError(error.text, $scope.pageText.failedToGetUnclaimedAlertsHeader);
    });

    $scope.$on('translations.received', function() {
      setPageText();
    });
  };
  init();
}]);
