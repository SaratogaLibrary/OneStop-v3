// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Fines',
[
  'ewOneStop-Languages'
])

.factory('FineItem',
[
function() {
  'use strict';

  var parse = function(data) {
    var pattern = /(\S*)\s+\$?(\d+\.\d+)\s+\"(\S*)\"\s+(.*)/;
    var matches = pattern.exec(data);
    var fields = [];
    if (!matches || matches.length < 1) {
      fields.push(data);
    } else {
      for (var x = 1; x < matches.length; ++x) {
        fields.push(matches[x]);
      }
    }
    return fields;
  };

  var FineItem = function(data) {
    var fields = parse(data);
    this.id = fields[0] || '';
    this.amount = Number(fields[1]) || 0;
    this.description = fields[2] || '';
    this.title = fields[3] || '';
  };

  return FineItem;
}])

.factory('FinesService',
[
  '$http',
  '$q',
  'LanguagesService',
function($http, $q, LanguagesService) {
  'use strict';

  var PAYMENT_RESULT = {
    SUCCESS: 0,
    CANCELED: 1,
    ERROR: 2
  };

  var getNodeValue = function(doc, nodeName) {
    var node = doc.getElementsByTagName(nodeName)[0];
    if (node && node.childNodes && node.childNodes[0]) {
      return node.childNodes[0].nodeValue;
    }
    // return undefined
  };

  var parse = function(xml) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(xml, 'text/xml');
    var root = doc.getElementsByTagName('finespay');
    if (!root || !root.length) {
      throw new Error(LanguagesService.translate('FINES_PAYMENT_INVALID_RESPONSE'));
    }
    return getNodeValue(root[0], 'result');
  };

  var payFines = function() {
    return $http
            .get('/selfCheck?action=payFines')
            .then(function(response) {
              var resultCode;
              try {
                var result = parse(response.data);
                resultCode = Number(result);
                if (isNaN(resultCode)) {
                  throw new Error(LanguagesService.translate('FINES_PAYMENT_INVALID_RESULT_CODE', [ result ]));
                }
              } catch (err) {
                return $q.reject({ code: PAYMENT_RESULT.ERROR, text: err.message });
              }

              if (resultCode === PAYMENT_RESULT.ERROR) {
                return $q.reject({ code: resultCode, text: LanguagesService.translate('FINES_PAYMENT_FAILED') });
              }
              return $q.when({ result: resultCode });
            }, function(error) {
              return $q.reject({ code: error.status, text: error.message || error.data });
            });
  };

  return {
    PAYMENT_RESULT: PAYMENT_RESULT,
    payFines: payFines
  };
}]);
