// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Utilities',
[

])

.factory('BooleanValue',
[
function() {
  'use strict';

  return function(value) {
    if (typeof value === 'boolean') { return value; }
    if (typeof value === 'string') {
      var numericValue = parseInt(value);
      if (isNaN(numericValue)) {
        value = value.toUpperCase();
        if ((value === 'TRUE') || (value === 'YES')) {
          return true;
        }
      } else {
        value = numericValue;
      }
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    return false;
  };
}])

.factory('ObjectProperty',
[
function() {
  'use strict';

  return function(obj, prop, defaultValue) {
    if (obj && obj.hasOwnProperty(prop)) {
      return obj[prop];
    }
    return defaultValue;
  };
}])

.factory('DateValue',
[
function() {
  'use strict';

  var DateValue = function(s) {
    var regEx = /(\d{4})(\d{2})(\d{2}).{4}(\d{2})(\d{2})(\d{2})/;
    var parts = regEx.exec(s);
    if (parts && (parts.length === 7)) {
      return new Date(parts[1], parts[2] - 1, parts[3], parts[4], parts[5], parts[6]).toString();
    }

    var date = new Date(s);
    if (!isNaN(date)) {
      return date.toString();
    }
    return s;
  };

  return DateValue;
}])

.factory('InputField',
[
  '$rootScope',
  '$timeout',
function($rootScope, $timeout) {
  'use strict';

  var focusLockSuspended = false;
  $rootScope.$on('suspendFocusLock', function() {
    focusLockSuspended = true;
  });

  $rootScope.$on('resumeFocusLock', function() {
    focusLockSuspended = false;
  });

  var elementId = function(id) {
    return '#' + id;
  };

  var InputField = function(id, canSubmitFn, submitFn, modelOptions) {
    this.id = id;
    this.lockFocus = true;
    this.canSubmitFn = canSubmitFn;
    this.submitFn = submitFn;
    this.modelOptions = modelOptions;
  };

  InputField.prototype.focus = function() {
    var el = angular.element(elementId(this.id));
    if (el) {
      el.focus();
    }
  };

  InputField.prototype.lostFocus = function($event) {
    if (this.lockFocus && !focusLockSuspended) {
      $event.preventDefault();
      $event.stopImmediatePropagation();
      this.focus();
    }
  };

  InputField.prototype.keypress = function($event) {
    if ($event.keyCode === 13) {
      var self = this;
      $timeout(function() {
        if ((!self.canSubmitFn || self.canSubmitFn.call()) && self.submitFn) {
          self.submitFn.call();
        }
      }, 0);
    }
  };

  return InputField;
}])

.factory('ElementFinder',
[
function() {
  'use strict';

  var find = function(selector) {
    return angular.element(selector);
  };

  return {
    find: find
  };
}]);
