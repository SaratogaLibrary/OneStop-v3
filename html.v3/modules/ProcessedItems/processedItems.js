// Copyright(c)2017 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-ProcessedItems',
[
  'ewOneStop-Preferences',
  'ewOneStop-Checkout',
  'ewOneStop-Checkin',
  'ewOneStop-Sounds',
  'ewOneStop-Utilities',
  'ewOneStop-Languages'
])

.factory('ProcessedItems',
[
  'CheckoutResult',
  'CheckinResult',
  'Sound',
  'PreferencesService',
  'BooleanValue',
function(CheckoutResult, CheckinResult, Sound, PreferencesService, BooleanValue) {
  'use strict';

  var ProcessedItem = function(item, status) {
    this.id = item.id;
    this.status = status;
    this.item = item;
    this.soundPlayed = false;
  };

  var find = function(item, container) {
    for (var x = 0; x < container.length; ++x) {
      if (item.id === container[x].id) {
        return container[x];
      }
    }
    return undefined;
  };

  var processContainer = function(resultType, results, container, status) {
    container.forEach(function(item) {
      var existingItem = find(item, results);
      if (existingItem) {
        if (existingItem.status !== status) {
          existingItem.status = status;
          existingItem.soundPlayed = false;   // reset the sound played flag when the status of the item has changed
        }
      } else {
        results.push(new ProcessedItem(new resultType(item), status));
      }
    });
  };

  var playSound = function(results, shouldPlaySound) {
    if (BooleanValue(PreferencesService.get('SoundsEnabled'))) {
      var unplayed = results.filter(function(item) { return !item.soundPlayed; });
      if (unplayed.length) {
        if (shouldPlaySound !== false) {
          if (unplayed.filter(function(item) { return item.status !== 'Success'; }).length) {
            Sound.play(PreferencesService.get('SoundsErrorSound'));
          } else {
            Sound.play(PreferencesService.get('SoundsSuccessSound'));
          }
        }
        // soundPlayed flag should still be set so sound is not played for this item in the future
        unplayed.forEach(function(item) {
          item.soundPlayed = true;
        });
      }
    }
  };

  var mergeCheckouts = function(processedItems, session, shouldPlaySound) {
    var results = processedItems.slice(0);
    processContainer(CheckoutResult, results, session.checkedOutItems, 'Success');
    processContainer(CheckoutResult, results, session.renewedItems, 'Success');
    processContainer(CheckoutResult, results, session.checkoutErrorItems, 'Error');
    processContainer(CheckoutResult, results, session.checkoutItemsPendingSecurityAdjustment, 'Pending');

    playSound(results, shouldPlaySound);
    return results;
  };

  var mergeCheckins = function(processedItems, session) {
    var results = processedItems.slice(0);
    processContainer(CheckinResult, results, session.checkedInItems, 'Success');
    processContainer(CheckinResult, results, session.checkinErrorItems, 'Error');
    processContainer(CheckinResult, results, session.checkinItemsPendingSecurityAdjustment, 'Pending');
    playSound(results);
    return results;
  };

  return {
    mergeCheckouts: mergeCheckouts,
    mergeCheckins: mergeCheckins
  };
}])

.factory('ProcessedItemsColumn',
[
function() {
  'use strict';

  var ProcessedItemsColumn = function(name, order, propertyName) {
    this.name = name;                 // the transalted name of the column (this will display in the table)
    this.order = order;               // the position of the column relative to other columns; actual index value is irrelevant
                                          // columns are sorted by their order and displayed least to greatest
    this.propertyName = propertyName; // the property of the entry.item whose value should be displayed in a cell in this column
  };

  return ProcessedItemsColumn;
}])

.factory('ProcessedItemsTable',
[
  '$filter',
  '$sce',
  'LanguagesService',
  'PreferencesService',
function($filter, $sce, LanguagesService, PreferencesService) {
  'use strict';

  var ProcessedItemsTable = function(columns) {
    this.columns = columns.filter(function(column) {
                            return column.order >= 0;
                          })
                          .sort(function(a, b) {
                            return a.order - b.order;
                          });
  };

  ProcessedItemsTable.prototype.generateHeaderRowContent = function() {
    var content = '';
    this.columns.forEach(function(column) {
      var s = '<th';
      if (isStatusColumn(column)) {
        s += ' class="text-center"';
      }
      s += '>' + column.name + '</th>';   // Note: the column name should already be translated
      content += s;
    });
    return $sce.trustAsHtml(content);
  };

  ProcessedItemsTable.prototype.generateEntryRowContent = function(entry,  confirmFeeFnCall) {
    var content = '';
    this.columns.forEach(function(column) {
      var s = '<td' + getClassAttribute(column) + '>';
      s += getCellContents(column, entry, confirmFeeFnCall);
      s += '</td>';
      content += s;
    });
    return $sce.trustAsHtml(content);
  };

  var isTitleColumn = function(column) {
    return (column.propertyName === 'title');
  };

  var isDueDateColumn = function(column) {
    return (column.propertyName === 'dueDate');
  };

  var isStatusColumn = function(column) {
    return (column.propertyName === 'status');
  };

  var isError = function(status) {
    return (status === 'Error');
  };

  var getStatusIcon = function(status) {
    switch (status) {
      case 'Success': return 'fa-check';
      case 'Error': return 'fa-times';
      case 'Pending': return 'fa-lock';
      default: return '';
    }
  };

  var getClassAttribute = function(column) {
    return isStatusColumn(column) ? ' class="checkedoutstatus"' : '';
  };

  var getCellContents = function(column, entry, confirmFeeFnCall) {
    if (isStatusColumn(column)) {
      if ((entry.item.feeAmount > 0) && isError(entry.status)) {
        var currencySymbol = PreferencesService.get('CurrencySymbol');
        var buttonText = LanguagesService.translate('CHECK_OUT_FEE_NOTICE_BUTTON', [ $filter('currency')(entry.item.feeAmount, currencySymbol) ]);
        return '<button class="btn btn-warning btn-small" ng-mousedown="' + confirmFeeFnCall + '">' + buttonText + '</button>';
      } else {
        return '<i class="fa ' + getStatusIcon(entry.status) + '" aria-hidden="true"></i>';
      }
    } else if (isDueDateColumn(column) && isError(entry.status)) {
      return '';
    } else {
      var contents = entry.item[column.propertyName] || '';
      if (isTitleColumn(column) && !contents) {
        contents = LanguagesService.translate('PROCESSED_ITEMS_TITLE_NOT_AVAILABLE');
        if (isError(entry.status) && entry.item.screenMessage) {
          var errorMessageColor = PreferencesService.get('ThemeImportantMessageColor'),
              errorStyle = '';
          if (errorMessageColor) {
            errorStyle = ' style="color:' + errorMessageColor +' !important;"';
          }
          contents += ': <span' + errorStyle + '>' + entry.item.screenMessage + '</span>';
        }
      }
      return contents;
    }
  };

  return ProcessedItemsTable;
}])

// See: https://stackoverflow.com/questions/20297638/call-function-inside-sce-trustashtml-string-in-angular-js
.directive('compileTemplate', function($compile, $parse){
  'use strict';
  return {
    link: function(scope, element, attr){
        var parsed = $parse(attr.ngBindHtml);
        function getStringValue() { return (parsed(scope) || '').toString(); }

        //Recompile if the template changes
        scope.$watch(getStringValue, function() {
            $compile(element, null, -9999)(scope);  //The -9999 makes it skip directives so that we do not recompile ourselves
        });
    }
  };
});
