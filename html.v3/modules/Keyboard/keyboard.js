// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Keyboard',
[
  'ewOneStop-Languages',
  'ewOneStop-Utilities'
])

.controller('AlphaKeyboardController',
[
  '$scope',
  'LanguagesService',
  'ElementFinder',
function($scope, LanguagesService, ElementFinder) {
  'use strict';

  var getInputElement = function() {
    return ElementFinder.find('#' + $scope.options.inputField);
  };

  var updateInputElement = function(el, text) {
    el.val(text).trigger('change');
  };

  $scope.keyPress = function(ch) {
    var el = getInputElement();
    if (el) {
      updateInputElement(el, el.val() + ch);
    }
  };

  $scope.backspace = function() {
    var el = getInputElement();
    if (el) {
      var text = el.val();
      if (text.length) {
        text = text.substr(0, text.length - 1);
        updateInputElement(el, text);
      }
    }
  };

  $scope.hide = function() {
    $scope.options.visible = false;
  };

  $scope.toggleShift = function() {
    $scope.options.lowerCase = !$scope.options.lowerCase;
  };

  var setPageText = function() {
    $scope.pageText = {
      capsButton: LanguagesService.translate('KEYPAD_CAPS_BUTTON')
    };
  };

  var init = function() {
    setPageText();
    $scope.$on('translations.received', function() {
      setPageText();
    });
  };
  init();
}])

.directive('alphaKeyboard',
[
function() {
  'use strict';

  return {
    restrict: 'E',
    scope: {
      options: '='
    },
    templateUrl: 'modules/Keyboard/alphaKeyboard.tmpl.html',
    replace: true,
    controller: 'AlphaKeyboardController'
  };
}]);
