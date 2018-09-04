// Copyright(c)2017-2018 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Items',
[
  'ewOneStop-Defaults',
  'ewOneStop-Utilities'
])

.factory('Item',
[
  'Defaults',
  'ObjectProperty',
  'DateValue',
function(Defaults, ObjectProperty, DateValue) {
  'use strict';

  var parse = function(str) {
    var pattern = /(\S*)\s+(\S+)\s+(\d+\/\d+\/\d+\S*)\s+\$?(\d+\.\d+)\s+b\s+(.*)/;  // Pattern for Hold Item details
    var matches = pattern.exec(str);
    var item = {};
    if (!matches || matches.length < 1) {
      pattern = /(\S*)\s+(\d+\/\d+\/\d+\S*)\s+(\S+)\s+b\s+\$?(\d+\.\d+)?\s*(.*)/;  // Pattern for Overdue Item details
      matches = pattern.exec(str);
      if (!matches || matches.length < 1) {
        item.id = str;
      } else {
        for (var overdueFieldIndex = 1; overdueFieldIndex < matches.length; ++overdueFieldIndex) {
          switch(overdueFieldIndex) {
            case 1:
              item.id = matches[overdueFieldIndex]; break;
            case 2:
              item.transactionDate = matches[overdueFieldIndex]; break;
            case 4:
              if (matches[overdueFieldIndex]) {
                item.feeAmount = Number(matches[overdueFieldIndex]);
                if (item.feeAmount) {
                  item.feeType = 'Overdue Fee';
                }
              }
              break;

            case 5:
              item.title = matches[overdueFieldIndex];
          }
        }
      }
    } else {
      for (var holdFieldIndex = 1; holdFieldIndex < matches.length; ++holdFieldIndex) {
        switch(holdFieldIndex) {
          case 1:
            item.id = matches[holdFieldIndex]; break;
          case 3:
            item.transactionDate = matches[holdFieldIndex]; break;
          case 4:
            item.feeAmount = Number(matches[holdFieldIndex]);
            if (item.feeAmount) {
              item.feeType = 'Hold Fee';
            }
            break;

          case 5:
            item.title = matches[holdFieldIndex];
        }
      }
    }
    return item;
  };

  var Item = function(data) {
    if (typeof data === 'string') {
      data = parse(data);
    }

    this.id = ObjectProperty(data, 'id', '');
    this.title = ObjectProperty(data, 'title', '');
    this.mediaType = ObjectProperty(data, 'mediaType', '');
    this.mediaTypeCode = Number(ObjectProperty(data, 'mediaTypeCode', ''));
    this.properties = ObjectProperty(data, 'properties', '');
    this.dueDate = ObjectProperty(data, 'dueDate', '');
    this.feeType = ObjectProperty(data, 'feeType', '');
    this.feeAmount = Number(ObjectProperty(data, 'feeAmount', 0));
    this.currencyType = ObjectProperty(data, 'currencyType', Defaults.CURRENCY_TYPE);
    this.permanentLocation = ObjectProperty(data, 'permanentLocation', '');
    this.currentLocation = ObjectProperty(data, 'currentLocation', '');
    this.owner = ObjectProperty(data, 'owner', '');
    this.holdQueueLength = Number(ObjectProperty(data, 'holdQueueLength', 0));
    this.transactionDate = DateValue(ObjectProperty(data, 'transactionDate', ''));
    this.recalledDate = DateValue(ObjectProperty(data, 'recalledDate', ''));
    this.holdPickupDate = DateValue(ObjectProperty(data, 'holdPickupDate', ''));
    this.screenMessage = ObjectProperty(data, 'screenMessage', '');
    this.printLine = ObjectProperty(data, 'printLine', '');

    if (isNaN(this.feeAmount)) {
      this.feeAmount = 0;
    }
  };

  Item.create = function(data) {
    return new Item(data);
  };

  return Item;
}])

.factory('ItemsService',
[
  '$http',
  '$q',
  'Item',
function($http, $q, Item) {
  'use strict';

  var getItem = function(itemId) {
    return $http({
              method: 'GET',
              url: '/selfCheck',
              params: {
                action: 'getItemRecord',
                itemId: itemId,
                nextPage: 'schemas/item.json',
                errorPage: 'schemas/error.json'
              }
            })
            .then(function(response) {
              if (response.data.code) {
                // This is an error response ( { code: [error code], text: '[error text]' } )
                return $q.reject(response.data);
              }
              return $q.when(Item.create(response.data));
            }, function(error) {
              return $q.reject({ code: error.status, text: error.message || error.data });
            });
  };

  return {
    getItem: getItem
  };
}]);
