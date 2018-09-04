// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-PageTimeout',
[
  'ewOneStop-Start',
  'ewOneStop-Languages'
])

.factory('PageTimeoutService',
[
  '$rootScope',
  '$document',
  '$interval',
  'StartService',
function($rootScope, $document, $interval, StartService) {
  'use strict';

  var INTERVAL = 1000,
      _timeoutValue,
      _timeRemaining = 0,
      _timer,
      _lastX,
      _lastY,
      _cbFn;

  var bindEvents = function() {
    var body = angular.element($document);
    body.bind('keydown', resetInactivityTimer);
    body.bind('keyup', resetInactivityTimer);
    body.bind('click', resetInactivityTimer);
    body.bind('mousemove', resetInactivityTimer);
    body.bind('mousewheel', resetInactivityTimer);
    body.bind('mousedown', resetInactivityTimer);
    body.bind('DOMMouseScroll', resetInactivityTimer);
    body.bind('touchstart', resetInactivityTimer);
    body.bind('touchmove', resetInactivityTimer);
    body.bind('scroll', resetInactivityTimer);
  };

  var unbindEvents = function() {
    var body = angular.element($document);
    body.unbind('keydown');
    body.unbind('keyup');
    body.unbind('click');
    body.unbind('mousemove');
    body.unbind('mousewheel');
    body.unbind('mousedown');
    body.unbind('DOMMouseScroll');
    body.unbind('touchstart');
    body.unbind('touchmove');
    body.unbind('scroll');
  };

  var startInactivityTimer = function(timeoutValue, callback) {
    timeoutValue *= INTERVAL;
    if (timeoutValue !== _timeoutValue) {
      _timeoutValue = timeoutValue;
      _timeRemaining = _timeoutValue;
      _cbFn = callback;
      if (isRunning()) {
        resetInactivityTimer();
      } else {
        bindEvents();
        _timer = $interval(updateInactivityTimer, INTERVAL);
      }
    } else {
      resetInactivityTimer();
    }
  };

  var resetInactivityTimer = function($event) {
    var moved = true;
    if ($event && ($event.type === 'mousemove')) {
      moved = (_lastX !== $event.pageX) || (_lastY !== $event.pageY);
      _lastX = $event.pageX;
      _lastY = $event.pageY;
    }

    if (moved && isRunning()) {
      $interval.cancel(_timer);
      _timeRemaining = _timeoutValue;
      _timer = $interval(updateInactivityTimer, INTERVAL);
    }
  };

  var updateInactivityTimer = function() {
    if (isRunning()) {
      _timeRemaining -= INTERVAL;
      if (_timeRemaining <= 0) {
        var callback = _cbFn;
        stopInactivityTimer();
        $rootScope.$broadcast('inactivity.timeout', {});
        if (callback) {
          callback();
        } else {
          StartService.startOver();
        }
      }
    }
  };

  var stopInactivityTimer = function() {
    if (isRunning()) {
      $interval.cancel(_timer);
      _timer = undefined;
      _timeRemaining = undefined;
      _timeoutValue = undefined;
      _cbFn = undefined;
      _lastX = undefined;
      _lastY = undefined;
      unbindEvents();
    }
  };

  var getTimeRemaining = function() {
    return isRunning() ? _timeRemaining / INTERVAL : undefined;
  };

  var isRunning = function() {
    return (!!_timer);
  };

  return {
    startInactivityTimer: startInactivityTimer,
    resetInactivityTimer: resetInactivityTimer,
    stopInactivityTimer: stopInactivityTimer,
    getTimeRemaining: getTimeRemaining,
    isRunning: isRunning
  };
}])

.controller('PageTimeoutController',
[
  '$scope',
  'PageTimeoutService',
  'LanguagesService',
function($scope, PageTimeoutService, LanguagesService) {
  'use strict';

  $scope.getTimeRemaining = function() {
    var timeRemaining = PageTimeoutService.getTimeRemaining();
    return !isNaN(timeRemaining) ? LanguagesService.translate('PAGE_TIMEOUT_TIME_REMAINING', [ timeRemaining ]) : '';
  };

  var setPageText = function() {
    $scope.pageText = {
      timeRemainingHeader: LanguagesService.translate('PAGE_TIMEOUT_TIME_REMAINING_HEADER')
    };
  };
  
  var init = function() {
    setPageText();

    $scope.$on('translations.received', function() {
      setPageText();
    });
  };
  init();
}]);
