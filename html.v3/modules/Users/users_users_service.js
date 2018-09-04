// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Users')

.factory('UsersService',
[
  '$http',
  '$q',
  'User',
function($http, $q, User) {
  'use strict';

  var currentUser = null;

  var getUser = function(userId, pin) {
    return $http({
              method: 'GET',
              url: '/selfCheck',
              params: {
                action: 'getUserRecord',
                userId: userId,
                pin: pin,
                requestDetail: 1,
                nextPage: 'schemas/user.json',
                errorPage: 'schemas/userValidationError.json'
              }
            })
            .then(function(response) {
              if (response.data.code) {
                // This is an error response ( { code: [error code], text: '[error text]' } )
                return $q.reject(response.data);
              }
              return $q.when(User.create(response.data));
            }, function(error) {
              return $q.reject({ code: error.status, text: error.message || error.data });
            });
  };

  var getCurrentUser = function() {
    return currentUser;
  };

  var setCurrentUser = function(user) {
    currentUser = user;
  };

  var clearCurrentUser = function() {
    currentUser = null;
  };

  return {
    getUser: getUser,
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    clearCurrentUser: clearCurrentUser
  };
}]);
