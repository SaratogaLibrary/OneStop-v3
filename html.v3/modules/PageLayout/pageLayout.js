// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-PageLayout',
[
  'common.viewport-size'
])

.factory('PageLayoutService',
[
  '$rootScope',
  'viewportSize',
function($rootScope, viewportSize) {
  'use strict';

  var getViewport = function() {
    return { height: viewportSize.height, width: viewportSize.width };
  };

  var isLandscape = function() {
    var size = getViewport();
    return (size.width > size.height);
  };

  var isPortrait = function() {
    return !isLandscape();
  };

  return {
    getViewport: getViewport,
    isLandscape: isLandscape,
    isPortrait: isPortrait
  };
}]);
