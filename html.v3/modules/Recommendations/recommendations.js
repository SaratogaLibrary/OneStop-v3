// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Recommendations',
[
  'ui.bootstrap',
  'ewOneStop-Sessions',
  'ewOneStop-Users',
  'ewOneStop-Holds',
  'ewOneStop-Languages',
  'ewOneStop-Utilities'
])

.factory('Recommendation',
[
  'ObjectProperty',
function(ObjectProperty) {
  'use strict';

  var Recommendation = function(data) {
    this.uniqueId = ObjectProperty(data, 'uniqueId', '');
    this.title = ObjectProperty(data, 'title', '');
    this.fullTitle = ObjectProperty(data, 'fullTitle', '');
    this.author = ObjectProperty(data, 'author', '');
    this.fullAuthor = ObjectProperty(data, 'fullAuthor', '');
    this.primaryIsbn = ObjectProperty(data, 'primaryIsbn', '');
    this.primaryBibId = ObjectProperty(data, 'primaryBibId', '');
    this.rating = ObjectProperty(data, 'rating', 0);
    this.description = ObjectProperty(data, 'description', '');
    this.bookjacketUrl = ObjectProperty(data, 'bookjacketUrl', '');
  };

  return Recommendation;
}])

.factory('RecommendationsService',
[
  '$http',
  '$q',
  'Recommendation',
  'Session',
function($http, $q, Recommendation, Session) {
  'use strict';

  var uri = '/selfCheck';

  var getNodeValue = function(doc, nodeName) {
    var node = doc.getElementsByTagName(nodeName)[0];
    if (node && node.childNodes[0]) {
      return node.childNodes[0].nodeValue;
    }
    // return undefined
  };

  var parse = function(xml) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(xml, 'text/xml');
    var results = [];
    var recommendations = doc.getElementsByTagName('RECOMMENDATION');
    for (var x = 0; x < recommendations.length; ++x) {
      var data = {};
      data.uniqueId = getNodeValue(recommendations[x], 'UNIQUE_ID');
      data.title = getNodeValue(recommendations[x], 'TITLE');
      data.fullTitle = getNodeValue(recommendations[x], 'FULL_TITLE');
      data.author = getNodeValue(recommendations[x], 'AUTHOR');
      data.fullAuthor = getNodeValue(recommendations[x], 'FULL_AUTHOR');
      data.primaryIsbn = getNodeValue(recommendations[x], 'PRIMARY_ISBN');
      data.primaryBibId = getNodeValue(recommendations[x], 'PRIMARY_BIB_ID');
      data.rating = Number(getNodeValue(recommendations[x], 'RATING'));
      data.description = getNodeValue(recommendations[x], 'DESCRIPTION');
      data.bookjacketUrl = getNodeValue(recommendations[x], 'BOOKJACKET_URL');
      results.push(new Recommendation(data));
    }
    return results;
  };

  var getRecommendations = function() {
    return $http
            .get(uri + '?action=getRecommendations')
            .then(function(response) {
              if (response.data.code) {
                return $q.reject(response.data);
              }
              return $q.when(parse(response.data));
            }, function(error) {
              return $q.reject({ code: error.status, text: error.message || error.data });
            });
  };

  var saveRecommendation = function(isbn) {
    return $http({
              method: 'GET',
              url: uri,
              params: {
                action: 'saveRecommendation',
                isbn: isbn,
                nextPage: 'schemas/checkoutSession.json',
                errorPage: 'schemas/error.json'
              }
            })
            .then(function(response) {
              if (response.data.code) {
                return $q.reject(response.data);
              }
              return $q.when(Session.create(response.data));
            }, function(error) {
              return $q.reject({ code: error.status, text: error.message || error.data });
            });
  };

  return {
    getRecommendations: getRecommendations,
    saveRecommendation: saveRecommendation
  };
}])

.factory('RecommendationDetailsDialogService',
[
  '$uibModal',
function($uibModal) {
  'use strict';

  var showRecommendationDetails = function(recommendation) {
    var dialogOptions = {
      animation: true,
      backdrop: 'static',
      controller: 'RecommendationDetailsDialogController',
      keyboard: true,
      size: 'md',
      templateUrl: 'modules/Recommendations/recommendationDetailsDialog.tmpl.html',
      resolve: {
        recommendation: recommendation
      }
    };

    return $uibModal.open(dialogOptions).result;
  };

  return {
    showRecommendationDetails: showRecommendationDetails
  };
}])

.controller('RecommendationDetailsDialogController',
[
  '$scope',
  '$uibModalInstance',
  'RecommendationsService',
  'LanguagesService',
  'UsersService',
  'HoldsService',
  'PreferencesService',
  'BooleanValue',
  'recommendation',
function( $scope,
          $uibModalInstance,
          RecommendationsService,
          LanguagesService,
          UsersService,
          HoldsService,
          PreferencesService,
          BooleanValue,
          recommendation) {
  'use strict';

  $scope.close = function() {
    $uibModalInstance.close({ how: 'Closed' });
  };

  $scope.saveRecommendation = function() {
    $scope.saveButtonDisabled = true;
    RecommendationsService
    .saveRecommendation(recommendation.primaryIsbn)
    .then(function(/*session*/) {
      $uibModalInstance.close({ how: 'Saved' });
    })
    .catch(function(error) {
      $uibModalInstance.dismiss({ how: 'SaveFailed', data: error });
    });
  };

  $scope.placeHold = function() {
    $scope.holdButtonDisabled = true;
    var user = UsersService.getCurrentUser(),
        itemIdType = PreferencesService.get('NovelistHoldRequestItemIdType').toUpperCase() || 'BIB_ID',
        itemId;

    switch (itemIdType) {
      case 'ISBN':
        itemId = recommendation.primaryIsbn; break;
      case 'TITLE':
        itemId = recommendation.title; break;
      default:
        itemId = recommendation.primaryBibId;
    }

    HoldsService.placeHold(user.id, user.pin, itemId, itemIdType)
    .then(function(hold) {
      if (hold.isOk()) {
        $uibModalInstance.close({ how: 'HoldPlaced', data: hold });
      } else {
        $uibModalInstance.dismiss({ how: 'HoldFailed', data: hold });
      }
    })
    .catch(function(error) {
      $uibModalInstance.dismiss({ how: 'HoldFailed', data: error });
    });
  };

  var init = function() {
    $scope.pageText = {
      byLine: LanguagesService.translate('RECOMMENDATION_BY_LINE'),
      saveButton: LanguagesService.translate('RECOMMENDATION_SAVE_BUTTON'),
      closeButton: LanguagesService.translate('RECOMMENDATION_CLOSE_BUTTON'),
      placeHoldButton: LanguagesService.translate('RECOMMENDATION_PLACE_HOLD_BUTTON')
    };

    $scope.should = {
      allowHolds: BooleanValue(PreferencesService.get('NovelistAllowUserToPlaceHold'))
    };
    $scope.saveButtonDisabled = false;
    $scope.holdButtonDisabled = false;
    $scope.recommendation = recommendation;

    $scope.$on('inactivity.timeout', function() {
      $uibModalInstance.dismiss('timeout');
    });
  };
  init();
}]);
