// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Languages',
[

  'ui.bootstrap',
  'ewOneStop-Preferences',
  'ewOneStop-Utilities'
])

.factory('LanguagesService',
[
  '$rootScope',
  '$http',
  '$q',
  '$uibModal',
  'PreferencesService',
function($rootScope, $http, $q, $uibModal, PreferencesService) {
  'use strict';

  var defaultPageText,
      currentPageText,
      currentLanguageCode;

  var getDefaultLanguageCode = function() {
    return PreferencesService.get('DefaultLanguageCode') || 'en_us';
  };

  var getCurrentLanguageCode = function() {
    return currentLanguageCode || getDefaultLanguageCode();
  };

  var getSupportedLanguages = function() {
    var languages = PreferencesService.get('SupportedLanguages');
    if (languages) {
      return languages.split(',')
      .map(function(language) {
        var parts = language.split(':');
        return { name: parts[0], code: parts[1] };
      });
    }
    return [];
  };

  var canChangeLanguage = function() {
    return getSupportedLanguages().length > 1;
  };

  var showChooseLanguageDialog = function() {
    var options = {
      animation: true,
      backdrop: 'static',
      controller: 'ChooseLanguageDialogController',
      keyboard: true,
      size: 'md',
      templateUrl: 'modules/Languages/chooseLanguageDialog.tmpl.html',
      resolve: {
        context: {}
      }
    };
    return $uibModal.open(options).result;
  };

  var changeLanguage = function(newLanguageCode) {
    return $http({
            url: '/selfCheck',
            method: 'GET',
            params: {
              action: 'changeLanguage',
              languageCode: newLanguageCode,
              nextPage: 'schemas/statusSession.json',
              errorPage: 'schemas/error.json'
            }
          })
          .then(function(response) {
            if (response.data && response.data.code) {
              return $q.when({ __ERROR_CODE__: response.data.code, __ERROR_TEXT__: response.data.text });
            } else {
              var getDefaults;
              if (!defaultPageText) {
                getDefaults = getDefaultPageText();
              } else {
                getDefaults = $q.when(defaultPageText);
              }

              return $q.all([ getDefaults, getPageTextForLanguage(newLanguageCode) ])
              .then(function(results) {
                currentLanguageCode = newLanguageCode;
                for (var lbl in results[1]) {
                  if (results[1].hasOwnProperty(lbl)) {
                    currentPageText[lbl] = results[1][lbl];
                  }
                }
                $rootScope.$broadcast('translations.received', {});
                return $q.when(currentPageText);
              });
            }
          }, function(error) {
            return $q.when({ __ERROR_CODE__: error.status, __ERROR_TEXT__: error.data || error });
          });
  };

  var getPageTextSet = function(languageCode, isOverride) {
    return $http({
              url: '/selfCheck',
              method: 'GET',
              params: {
                action: 'refresh',
                contenttemplate: 'translations/' + languageCode + (isOverride ? '_override' : '') + '.json',
                errorPage: 'schemas/error.json'
              }
            })
            .then(function(response) {
              if (response.data.code) {
                return $q.when({ __ERROR_CODE__: response.data.code, __ERROR_TEXT__: response.data.text });
              } else {
                var pattern = /<h2>(.*?):\s*(.*?)<\/h2>/;
                var matches = pattern.exec(response.data);
                if (matches && (matches.length > 2)) {
                  return $q.when({ __ERROR_CODE__: matches[1], __ERROR_TEXT__: matches[2] });
                }
                return $q.when(response.data);
              }
            }, function(error) {
              return $q.when({ __ERROR_CODE__: error.status, __ERROR_TEXT__: error.data || error });
            });
  };

  var getPageTextForLanguage = function(languageCode) {
    return $q.all([ getPageTextSet(languageCode), getPageTextSet(languageCode, true) ])
            .then(function(results) {
              for (var lbl in results[1]) {
                if (results[1].hasOwnProperty(lbl)) {
                  results[0][lbl] = results[1][lbl];
                }
              }
              return $q.when(results[0]);
            });
  };

  var getDefaultPageText = function() {
    return getPageTextForLanguage(getDefaultLanguageCode())
            .then(function(text) {
              defaultPageText = text;
              currentPageText = angular.copy(defaultPageText);
              return $q.when(defaultPageText);
            });
  };

  var translate = function(label, params) {
    console.log('Defaults: ' + JSON.stringify(defaultPageText, null, 2));
    console.log('Current: ' + JSON.stringify(currentPageText, null, 2));

    var text;
    if (currentPageText) {
      if (currentPageText.hasOwnProperty(label)) {
        text = currentPageText[label];
        var pattern = /.*(\{.*?\}).*/g;
        var matches = pattern.exec(text);
        while (matches) {
          for (var x = 1; x < matches.length; ++x) {
            var param = matches[x].slice(1, matches[x].length - 1),
            replacement = '[?]';
            console.log('Param: ' + param);
            if (currentPageText[param]) {
              replacement = currentPageText[param];
            } else if (!isNaN(param)) {
              var index = Number(param) - 1;
              if (params && (index < params.length)) {
                replacement = params[index];
              }
            }
            text = text.replace(matches[x], replacement);
          }
          pattern = /.*(\{.*?\}).*/g;
          matches = pattern.exec(text);
        }
      } else {
        text = '[?]';
      }
    } else {
      text = label;
    }
    return text;
  };

  return {
    getDefaultLanguageCode: getDefaultLanguageCode,
    getCurrentLanguageCode: getCurrentLanguageCode,
    getSupportedLanguages: getSupportedLanguages,
    canChangeLanguage: canChangeLanguage,
    showChooseLanguageDialog: showChooseLanguageDialog,
    changeLanguage: changeLanguage,
    getPageTextSet: getPageTextSet,
    getDefaultPageText: getDefaultPageText,
    translate: translate
  };
}])

.controller('LanguagesController',
[
  '$scope',
  '$interval',
  'LanguagesService',
  'PreferencesService',
  'BooleanValue',
function($scope, $interval, LanguagesService, PreferencesService, BooleanValue) {
  'use strict';

  var ROTATION_INTERVAL = 3000,
      languageIndex;

  $scope.showChooseLanguageDialog = function() {
    LanguagesService.showChooseLanguageDialog()
    .then(function(language) {
      LanguagesService.changeLanguage(language.code);
    });
  };

  var rotateChangeLanguageButtonText = function() {
    if (++languageIndex >= $scope.languages.length) {
      languageIndex = 0;
    }
    setChangeLanguageButtonText($scope.languages[languageIndex].name);
  };

  var setChangeLanguageButtonText = function(languageName) {
    $scope.changeLanguageButtonText = languageName;
  };

  var init = function() {
    languageIndex = 0;
    $scope.canChangeLanguage = LanguagesService.canChangeLanguage();
    if ($scope.canChangeLanguage) {
      $scope.languages = LanguagesService.getSupportedLanguages();
      setChangeLanguageButtonText($scope.languages[0].name);
      $interval(rotateChangeLanguageButtonText, ROTATION_INTERVAL);
    }

    $scope.$on('route.change', function(event, args) {
      $scope.canChangeLanguage = LanguagesService.canChangeLanguage() && (args.isInitialState || BooleanValue(PreferencesService.get('ShowLanguagesOnAllPages')));
    });
  };
  init();
}])

.controller('ChooseLanguageDialogController',
[
  '$scope',
  '$uibModalInstance',
  'LanguagesService',
  /*'context',*/
function($scope, $uibModalInstance, LanguagesService/*, context*/) {
  'use strict';

  $scope.close = function(language) {
    $scope.$emit('resumeFocusLock');
    $uibModalInstance.close(language);
  };

  $scope.cancel = function(reason) {
    $scope.$emit('resumeFocusLock');
    $uibModalInstance.dismiss(reason || 'cancel');
  };

  var init = function() {
    $scope.$emit('suspendFocusLock');

    $scope.pageText = {
      header: LanguagesService.translate('LANGUAGE_CHANGE_LANGUAGE'),
      cancelButton: LanguagesService.translate('LANGUAGE_CANCEL_BUTTON')
    };

    $scope.languages = LanguagesService.getSupportedLanguages();

    $scope.$on('inactivity.timeout', function() {
      $scope.cancel('timeout');
    });
  };
  init();
}])

.factory('LanguageCodesService',
[
  'LanguagesService',
function(LanguagesService) {
  'use strict';

  var languages = {
    ENGLISH: 'en_us',
    FRENCH: 'fr',
    GERMAN: 'de',
    ITALIAN: 'it',
    DUTCH: 'nl',
    SWEDISH: 'sv',
    FINNISH: 'fi',
    SPANISH: 'es',
    DANISH: 'da',
    PORTUGUESE: 'pt',
    'CANADIAN FRENCH': 'fr-ca',
    'CANADIAN-FRENCH': 'fr-ca',
    NORWEGIAN: 'nn',
    HEBREW: 'he',
    JAPANESE: 'ja',
    RUSSIAN: 'ru',
    ARABIC: 'ar',
    POLISH: 'pl',
    GREEK: 'el',
    CHINESE: 'zh',
    KOREAN: 'ko',
    'NORTH AMERICAN SPANISH': 'es-us',
    TAMIL: 'ta',
    MALAY: 'ms',
    'UNITED KINGDOM': 'en-gb',
    ICELANDIC: 'is',
    BELGIAN: 'fr-be',
    TAIWANESE: 'zh-tw'
  };

  return {
    getLanguageCode: function(language) {
      var key = language.toUpperCase();
      if (languages[key]) {
        return languages[key];
      }
      return LanguagesService.getDefaultLanguageCode();
    }
  };
}]);
