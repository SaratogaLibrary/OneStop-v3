// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Sounds',
[

])

.factory('Sound',
[
function() {
  'use strict';

  var Sound = {
    play: function(path) {
      var audio = new Audio(path);
      audio.play();
    }
  };

  return Sound;
}]);
