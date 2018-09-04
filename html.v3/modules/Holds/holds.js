// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Holds',
[
  'ewOneStop-Utilities'
])

.factory('HoldResult',
[
  'BooleanValue',
  'ObjectProperty',
function(BooleanValue, ObjectProperty) {
  'use strict';

  var HoldResult = function(data) {
    data = data || {};
    this.ok = ObjectProperty(data, 'ok', 'No');
    this.available = ObjectProperty(data, 'available', 'No');
    this.transactionDate = ObjectProperty(data, 'transactionDate', '');
    this.expirationDate = ObjectProperty(data, 'expirationDate', '');
    this.queuePosition = Number(ObjectProperty(data, 'queuePosition', '-1'));
    this.pickupLocation = ObjectProperty(data, 'pickupLocation', '');
    this.userId = ObjectProperty(data, 'userId', '');
    this.itemId = ObjectProperty(data, 'itemId', '');
    this.itemTitle = ObjectProperty(data, 'itemTitle', '');
    this.screenMessage = ObjectProperty(data, 'screenMessage', '');
    this.printLine = ObjectProperty(data, 'printLine', '');
    this.error = {
      code: Number(ObjectProperty(data.error, 'code', '0')),
      text: ObjectProperty(data.error, 'text', '')
    };
  };

  HoldResult.prototype.isOk = function() { return BooleanValue(this.ok); };
  HoldResult.prototype.isAvailable = function() { return BooleanValue(this.available); };

  HoldResult.create = function(data) {
    return new HoldResult(data);
  };

  return HoldResult;
}])

.factory('HoldsService',
[
  '$http',
  '$q',
  'HoldResult',
function($http, $q, HoldResult) {
  'use strict';

  var placeHold = function(userId, pin, itemId, itemIdType) {
    return $http({
              method: 'GET',
              url: '/selfCheck',
              params: {
                action: 'placeHold',
                userId: userId,
                pin: pin || undefined,
                itemId: itemId,
                itemIdType: itemIdType || 'BIB_ID',
                nextPage: 'schemas/holdResult.json',
                errorPage: 'schemas/holdResult.json'            // The placeHold OneStop action combines the Error object with the Hold object so both can be obtained with the same schema
              }
            })
            .then(function(response) {
              return $q.when(HoldResult.create(response.data));
            }, function(error) {
              return $q.reject({ code: error.data.code || error.status, text: error.data.text || error.data || error });
            });
  };

  return {
    placeHold: placeHold
  };
}]);
