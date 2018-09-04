// Copyright(c)2017-2018 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Start',
[
  'ngRoute',
  'ewOneStop-Preferences',
  'ewOneStop-Users',
  'ewOneStop-Sessions',
  'ewOneStop-Dialogs',
  'ewOneStop-Languages'
])

.factory('StartService',
[
  '$location',
  '$route',
  'PreferencesService',
  'UsersService',
  'SessionsService',
  'LanguagesService',
  'DialogService',
function($location, $route, PreferencesService, UsersService, SessionsService, LanguagesService, DialogService) {
  'use strict';

  var defaultInitialState = 'menu',
      allowedInitialStates = ['menu', 'checkout', 'checkin'];

  var getInitialState = function() {
    var initialState = PreferencesService.get('InitialState');
    if (!initialState) {
      initialState = defaultInitialState;
    } else {
      if (allowedInitialStates.indexOf(initialState) < 0) {
        DialogService.showError(LanguagesService.translate('START_INVALID_INITIAL_STATE', [ initialState, defaultInitialState ]));
        initialState = defaultInitialState;
      }
    }

    if (initialState === 'checkout') {
      initialState = 'login';
    }
    return initialState;
  };

  var getPageName = function(url) {
    return url ? url.replace('/', '') : '';
  };

  var isInitialState = function(currentRoute) {
    var pageName = getPageName(currentRoute),
        initialState = getInitialState();

    return (pageName === initialState);
  };

  var startOver = function() {
    SessionsService.reset()
    .then(function() {})
    .catch(function() {})
    .finally(function() {
      LanguagesService.changeLanguage(LanguagesService.getDefaultLanguageCode());
      UsersService.setCurrentUser(null);
      var initialState = getInitialState();
      if (isInitialState($location.path())) {
        $route.reload();
      } else {
        $location.path(initialState);
      }
    });
  };

  return {
    getInitialState: getInitialState,
    isInitialState: isInitialState,
    startOver: startOver
  };
}])

.controller('StartController',
[
  'StartService',
function(StartService) {
  'use strict';

  var init = function() {
    StartService.startOver();
  };
  init();
}]);
