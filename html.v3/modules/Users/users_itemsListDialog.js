// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Users')

.factory('ItemsListDialog',
[
  '$uibModal',
  'PreferencesService',
  'LanguagesService',
function($uibModal, PreferencesService, LanguagesService) {
  'use strict';

  var show = function(pageHeader, templateUrl, controller, items, allowRenew) {
    var dialogOptions = {
      animation: true,
      backdrop: 'static',
      controller: controller,
      keyboard: true,
      size: 'lg',
      templateUrl: templateUrl,
      resolve: {
        context: {
          pageHeader: pageHeader,
          items: items
        }
      }
    };

    if (typeof allowRenew === 'boolean') {
      dialogOptions.resolve.context.allowRenew = allowRenew;
    }
    return $uibModal.open(dialogOptions).result;
  };

  var showChargedItems = function(items, canRenew) {
    return show(LanguagesService.translate('ITEM_DETAILS_CHARGED_ITEMS_HEADER'), 'modules/Users/chargedItemsListDialog.tmpl.html', 'ItemsListDialogController', items, canRenew);
  };

  var showOverdueItems = function(items, canRenew) {
    return show(LanguagesService.translate('ITEM_DETAILS_OVERDUE_ITEMS_HEADER'), 'modules/Users/chargedItemsListDialog.tmpl.html', 'ItemsListDialogController', items, canRenew);
  };

  var showHoldItems = function(items) {
    return show(LanguagesService.translate('ITEM_DETAILS_HOLD_ITEMS_HEADER'), 'modules/Users/holdItemsListDialog.tmpl.html', 'ItemsListDialogController', items);
  };

  var showFineItems = function(fines) {
    return show(LanguagesService.translate('ITEM_DETAILS_FINE_ITEMS_HEADER'), 'modules/Users/fineItemsListDialog.tmpl.html', 'FineItemsListDialogController', fines);
  };

  return {
    show: show,
    showChargedItems: showChargedItems,
    showOverdueItems: showOverdueItems,
    showHoldItems: showHoldItems,
    showFineItems: showFineItems
  };
}])

.controller('ItemsListDialogController',
[
  '$scope',
  '$uibModalInstance',
  '$q',
  'CheckoutService',
  'LanguagesService',
  'ItemsService',
  'Item',
  'DetailsListRangeController',
  'context',
function($scope, $uibModalInstance, $q, CheckoutService, LanguagesService, ItemsService, Item, DetailsListRangeController, context) {
  'use strict';

  var ITEMS_PER_PAGE = 7;

  $scope.close = function() {
    $uibModalInstance.close();
  };

  $scope.renew = function(item) {
    item.renewalIsPending = true;
    CheckoutService.renew(item.id)
    .then(function(result) {
      handleRenewal(item, result);
    })
    .catch(function(error) {
      handleFailedRenewal(item, error);
    })
    .finally(function() {
      item.renewalIsPending = false;
    });
  };

  $scope.renewAll = function() {
    $scope.renewAllButtonDisabled = true;
    renewItem(0, $scope.items);
  };

  $scope.itemIsOnPage = function(item) {
    var index = $scope.items.indexOf(item);
    return (index >= $scope.range.getFirstItemIndex()) && (index <= $scope.range.getLastItemIndex());
  };

  $scope.canRenewAll = function() {
    return $scope.should.allowRenew && !($scope.items.every(function(item) { return item.hasBeenRenewed || item.failedToRenew; }));
  };

  var renewItem = function(index, items) {
    var promise;
    if (items[index].hasBeenRenewed || items[index].failedToRenew) {
      promise = $q.resolve();
    } else {
      promise = CheckoutService.renew(items[index].id);
    }

    promise.then(function(result) {
      if (result) {
        handleRenewal(items[index], result);
      }
    })
    .catch(function(error) {
      handleFailedRenewal(items[index], error);
    })
    .finally(function() {
      if (++index < items.length) {
        renewItem(index, items);
      } else {
        $scope.renewAllButtonDisabled = false;
      }
    });
  };

  var handleRenewal = function(item, renewResult) {
    item.hasBeenRenewed = true;
    item.dueDate = renewResult.dueDate;
  };

  var handleFailedRenewal = function(item, error) {
    item.failedToRenew = true;
    item.screenMessage = error.text;
  };

  var getItem = function(index, items) {
    ItemsService.getItem(items[index].id)
    .then(function(item) {
      item.hasBeenRetrieved = true;
      $scope.items[index] = item;
    })
    .catch(function(error) {
      var i = new Item({
        id: items[index],
        title: $scope.pageText.failedToRetrieveItem + ': ' + items[index] + ' (' + error.text + ')'
      });
      i.hasBeenRetrieved = false;
      $scope.items[index] = i;
    })
    .finally(function() {
      if (++index < items.length) {
        getItem(index, items);
      }
    });
  };

  var setPageText = function() {
    $scope.pageText = {
      titleColumnHeader: LanguagesService.translate('ITEM_DETAILS_COLUMN_HEADER_FOR_TITLE'),
      mediaTypeColumnHeader: LanguagesService.translate('ITEM_DETAILS_COLUMN_HEADER_FOR_MEDIA_TYPE'),
      dueDateColumnHeader: LanguagesService.translate('ITEM_DETAILS_COLUMN_HEADER_FOR_DUE_DATE'),
      holdExpirationDateColumnHeader: LanguagesService.translate('ITEM_DETAILS_COLUMN_HEADER_FOR_HOLD_EXPIRATION_DATE'),
      retrievingItem: LanguagesService.translate('ITEM_DETAILS_RETRIEVING_ITEM'),
      failedToRetrieveItem: LanguagesService.translate('ITEM_DETAILS_FAILED_TO_RETRIEVE_ITEM'),
      titleNotAvailable: LanguagesService.translate('ITEM_DETAILS_TITLE_NOT_AVAILABLE'),
      renewed: LanguagesService.translate('ITEM_DETAILS_STATUS_RENEWED'),
      notRenewed: LanguagesService.translate('ITEM_DETAILS_STATUS_NOT_RENEWED'),
      renewButton: LanguagesService.translate('ITEM_DETAILS_RENEW_BUTTON'),
      renewAllButton: LanguagesService.translate('ITEM_DETAILS_RENEW_ALL_BUTTON'),
      closeButton: LanguagesService.translate('ITEM_DETAILS_CLOSE_BUTTON')
    };
  };

  var init = function() {
    setPageText();

    $scope.ITEMS_PER_PAGE = ITEMS_PER_PAGE;
    $scope.items = context.items;
    if (context.items.length) {
      getItem(0, context.items);
    }
    $scope.pageHeader = context.pageHeader;
    $scope.should = {
      allowRenew: !(!context.allowRenew)
    };
    $scope.renewAllButtonDisabled = false;
    $scope.range = new DetailsListRangeController($scope.ITEMS_PER_PAGE, $scope.items);

    $scope.$on('inactivity.timeout', function() {
      $uibModalInstance.dismiss('timeout');
    });
  };
  init();
}])

.controller('FineItemsListDialogController',
[
  '$scope',
  '$uibModalInstance',
  'LanguagesService',
  'DetailsListRangeController',
  'context',
function($scope, $uibModalInstance, LanguagesService, DetailsListRangeController, context) {
  'use strict';

  var ITEMS_PER_PAGE = 7;

  $scope.close = function() {
    $uibModalInstance.close();
  };

  $scope.itemIsOnPage = function(item) {
    var index = $scope.fines.indexOf(item);
    return (index >= $scope.range.getFirstItemIndex()) && (index <= $scope.range.getLastItemIndex());
  };

  var setPageText = function() {
    $scope.pageText = {

      titleColumnHeader: LanguagesService.translate('ITEM_DETAILS_COLUMN_HEADER_FOR_TITLE'),
      descriptionColumnHeader: LanguagesService.translate('ITEM_DETAILS_COLUMN_HEADER_FOR_FINE_DESCRIPTION'),
      amountColumnHeader: LanguagesService.translate('ITEM_DETAILS_COLUMN_HEADER_FOR_FINE_AMOUNT'),
      retrievingItem: LanguagesService.translate('ITEM_DETAILS_RETRIEVING_ITEM'),
      closeButton: LanguagesService.translate('ITEM_DETAILS_CLOSE_BUTTON')
    };
  };

  var init = function() {
    setPageText();
    $scope.pageHeader = context.pageHeader;
    $scope.fines = context.items;
    $scope.ITEMS_PER_PAGE = ITEMS_PER_PAGE;
    $scope.range = new DetailsListRangeController($scope.ITEMS_PER_PAGE, $scope.fines);

    $scope.$on('inactivity.timeout', function() {
      $uibModalInstance.dismiss('timeout');
    });
  };
  init();
}])

.factory('DetailsListRangeController',
[
  'LanguagesService',
function(LanguagesService) {
  'use strict';

  var RangeController = function(itemsPerPage, items) {
    this.itemsPerPage = itemsPerPage;
    this.items = items;
    this.firstItemIndex = 0;
  };

  RangeController.prototype.getFirstItemIndex = function() { return this.firstItemIndex; };

  RangeController.prototype.getLastItemIndex = function() {
    return Math.min(this.getFirstItemIndex() + this.itemsPerPage, this.items.length) - 1;
  };

  RangeController.prototype.getText = function() {
    var text = '' + (this.getFirstItemIndex() + 1);
    if (this.items.length > 1) {
      text += '-' + (this.getLastItemIndex() + 1);
    }
    return LanguagesService.translate('ITEM_DETAILS_DISPLAY_RANGE', [ text, this.items.length ]);
  };

  RangeController.prototype.canGoBack = function() {
    return (this.getFirstItemIndex() >= this.itemsPerPage);
  };

  RangeController.prototype.goBack = function() {
    this.firstItemIndex -= this.itemsPerPage;
  };

  RangeController.prototype.canGoForward = function() {
    return (this.getLastItemIndex() + 1) < this.items.length;
  };

  RangeController.prototype.goForward = function() {
    this.firstItemIndex += this.itemsPerPage;
  };

  return RangeController;
}]);
