// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-HelpRequests',
[
  'ngRoute',
  'ewOneStop-Sessions',
  'ewOneStop-Users',
  'ewOneStop-Preferences',
  'ewOneStop-Languages'
])

.factory('HelpRequestsService',
[
  '$http',
  '$q',
  'Session',
function($http, $q, Session) {
  'use strict';

  var URI = '/selfCheck',
      Command = {
        CREATE: 'create',
        CANCEL: 'cancel'
      },
      isPending = false;

  var createOrCancelHelpRequest = function(command, page, patronName) {
    return $http({
      method: 'GET',
      url: URI,
      params: {
        action: 'requestHelp',
        details: page + ':' + patronName,
        helpRequestCommand: command,
        contentTemplate: 'schemas/statusSession.json',
        errorPage: 'schemas/error.json'
      }
    })
    .then(function(response) {
      if (response.data.code) {
        isPending = false;
        return $q.reject(response.data);
      }
      var session = Session.create(response.data);
      isPending = session.isHelpRequestPending();
      return $q.when(session);
    }, function(error) {
      isPending = false;
      return $q.reject({ code: error.status, text: error.message || error.data });
    });
  };

  var createHelpRequest = function(page, patronName) {
    return createOrCancelHelpRequest(Command.CREATE, page, patronName);
  };

  var cancelHelpRequest = function(page, patronName) {
    return createOrCancelHelpRequest(Command.CANCEL, page, patronName);
  };

  var helpRequestIsPending = function() {
    return isPending;
  };

  var clearPendingHelpRequest = function() {
    isPending = false;
  };

  return {
    createHelpRequest: createHelpRequest,
    cancelHelpRequest: cancelHelpRequest,
    helpRequestIsPending: helpRequestIsPending,
    clearPendingHelpRequest: clearPendingHelpRequest
  };
}])

.controller('HelpRequestsController',
[
  '$scope',
  '$route',
  'HelpRequestsService',
  'LanguagesService',
  'UsersService',
  'PreferencesService',
  'BooleanValue',
function($scope, $route, HelpRequestsService, LanguagesService, UsersService, PreferencesService, BooleanValue) {
  'use strict';

  var getPageName = function() {
    if ($route && $route.current && $route.current.originalPath) {
      return $route.current.originalPath.replace('/', '');
    }
    return '';
  };

  var getUserFullName = function() {
    var user = UsersService.getCurrentUser();
    return user ? user.fullName : undefined;
  };

  $scope.canRequestHelp = function() {
    return BooleanValue(PreferencesService.get('BranchManagerEnableHelpRequest'));
  };

  $scope.requestHelp = function() {
    HelpRequestsService.createHelpRequest(getPageName(), getUserFullName());
  };

  $scope.cancelHelpRequest = function() {
    HelpRequestsService.cancelHelpRequest(getPageName(), getUserFullName());
  };

  $scope.isHelpRequestPending = function() {
    return HelpRequestsService.helpRequestIsPending();
  };

  var init = function() {
    $scope.$on("translations.received", function() {
      $scope.pageText = {
        requestHelpButton: LanguagesService.translate('HELP_REQUESTS_REQUEST_HELP_BUTTON'),
        cancelHelpButton: LanguagesService.translate('HELP_REQUESTS_CANCEL_HELP_BUTTON')
      };
    });
  };
  init();
}]);
