// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-ButtonRow',
[
  'ewOneStop-Utilities'
])

.factory('ButtonRowButton',
[
  'ObjectProperty',
function(ObjectProperty) {
  'use strict';

  var ButtonRowButton = function(data) {
    this.text = ObjectProperty(data, 'text', '');
    this.action = ObjectProperty(data, 'action', null);
    this.enabled = ObjectProperty(data, 'enabled', true);
    this.visible = ObjectProperty(data, 'visible', true);
  };

  return ButtonRowButton;
}])

.factory('ButtonRowService',
[
function() {
  'use strict';

  var buttonRow = {
    buttons: []
  };

  var addButton = function(button) {
    buttonRow.buttons.push(button);
  };

  var reset = function() {
    // while (buttonRow.buttons.length) {
    //   buttonRow.buttons.pop();
    // }
    buttonRow.buttons = [];
  };

  return {
    buttonRow: buttonRow,
    addButton: addButton,
    reset: reset
  };
}])

.controller('ButtonRowController',
[
  '$scope',
  'ButtonRowService',
function($scope, ButtonRowService) {
  'use strict';

  var init = function() {
    $scope.buttonRow = ButtonRowService.buttonRow;
  };
  init();
}]);
