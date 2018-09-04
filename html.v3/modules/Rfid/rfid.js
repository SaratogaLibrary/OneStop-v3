// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Rfid',
[

])

.factory('RfidService',
[
  '$http',
  '$q',
function($http, $q) {
  'use strict';

  var performAction = function(params) {
    return $http({
      method: 'GET',
      url: '/selfCheck',
      params: params
    })
    .then(function(response) {
      if (response.data.code) {
        // This is an error response ( { code: [error code], text: '[error text]' } )
        return $q.reject(response.data);
      }
      return $q.when(response.data);
    }, function(error) {
      return $q.reject({ code: error.status, text: error.message || error.data });
    });
  };

  var enableRfid = function(action, schema) {
    if (action === 'checkout') {
      action = 'startRFIDCheckout';
    } else if (action === 'checkin') {
      action = 'startRFIDCheckin';
    } else if (action === 'libraryCard') {
      action = 'startRFIDGetLibraryCard';
    }

    return performAction({
              action: action,
              nextPage: 'schemas/' + schema + '.json',
              errorPage: 'schemas/error.json'
            });
  };

  var disableRfid = function(schema) {
    return performAction({
              action: 'finishRFID',
              nextPage: 'schemas/' + schema + '.json',
              errorPage: 'schemas/error.json'
            });
  };

  var getNodeValue = function(doc, nodeName) {
    var node = doc.getElementsByTagName(nodeName)[0];
    if (node && node.childNodes && node.childNodes[0]) {
      return node.childNodes[0].nodeValue;
    }
    // return undefined
  };

  var parseLibraryCardsResponse = function(xml) {
    var parser = new DOMParser(),
        doc = parser.parseFromString(xml, 'text/xml'),
        root = doc.getElementsByTagName('libraryCards'),
        id;

    if (root && root.length) {
      var cards = root[0].getElementsByTagName('libraryCard');
      if (cards && cards.length) {
        id = getNodeValue(cards[0], 'id');
      }
    }

    return id || '';
  };

  var getLibraryCard = function() {
    return $http.get('/selfCheck?action=getLibraryCard')
            .then(function(response) {
              try {
                var id = parseLibraryCardsResponse(response.data);
                return $q.when(id);
              } catch (error) {

              }
            });
  };

  return {
    enableRfid: enableRfid,
    disableRfid: disableRfid,
    getLibraryCard: getLibraryCard
  };
}]);
