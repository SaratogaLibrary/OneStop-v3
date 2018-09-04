// Copyright(c)2017-2018 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-CirculationStatistics',
[
  'ewOneStop-ButtonRow',
  'ewOneStop-Dialogs',
  'ewOneStop-Preferences',
  'ewOneStop-Languages'
])

.factory('CirculationStatisticsService',
[
  '$http',
  '$q',
  'LanguagesService',
  'PreferencesService',
function($http, $q, LanguagesService, PreferencesService) {
  'use strict';

  var performAction = function(params) {
    return $http({
              url: '/selfCheck',
              params: params
            })
            .then(function(response) {
              if (response.data.code) {
                return $q.reject(response.data);
              }
              return $q.when(response.data);
            }, function(error) {
              return $q.reject({ code: error.status, text: error.message || error.data });
            });
  };

  var view = function(from, to, transStatus, transType, mediaType) {
    var params = {
      action: 'viewStatistics',
      isoDateFrom: from ? from.toISOString().slice(0, 10) : undefined,
      isoDateTo: to ? to.toISOString().slice(0, 10) : undefined,
      transStatus: transStatus,
      transType: transType,
      mediaType: mediaType,
      nextPage: 'schemas/stats.json',
      errorPage: 'schemas/error.json'
    };
    return performAction(params);
  };

  var print = function() {
    var params = {
      action: 'printStatistics',
      templateFile: PreferencesService.get('WebServerDocumentRoot') + '/receiptTemplates/printStatisticsReport_' + LanguagesService.getCurrentLanguageCode().toLowerCase() + '.htm',
      nextPage: 'schemas/stats.json',
      errorPage: 'schemas/error.json'
    };
    return performAction(params);
  };

  return {
    view: view,
    print: print
  };
}])

.controller('CirculationStatisticsController',
[
  '$scope',
  '$location',
  'CirculationStatisticsService',
  'LanguagesService',
  'ButtonRowButton',
  'ButtonRowService',
  'DialogService',
function($scope, $location, CirculationStatisticsService, LanguagesService, ButtonRowButton, ButtonRowService, DialogService) {
  'use strict';

  var criteriaIsValid = function() {
    if ($scope.filters.fromDate && $scope.filters.toDate && $scope.filters.fromDate.toISOString().slice(0, 10) > $scope.filters.toDate.toISOString().slice(0, 10)) {
      DialogService.showError($scope.pageText.invalidDatesError);
      return false;
    }
    return true;
  };

  $scope.submit = function() {
    if (criteriaIsValid()) {
      CirculationStatisticsService.view($scope.filters.fromDate, $scope.filters.toDate, $scope.filters.transactionStatus.value, $scope.filters.transactionType.value, $scope.filters.mediaType.value)
      .then(function(stats) {
        $scope.stats = stats;

        // Change Submit to Refresh
        ButtonRowService.buttonRow.buttons[0].text = $scope.pageText.refreshButton;

        // Show the Print button
        ButtonRowService.buttonRow.buttons[1].enabled = true;
        ButtonRowService.buttonRow.buttons[1].visible = true;
      })
      .catch(function(error) {
        DialogService.showError(error.text, $scope.pageText.failedToRetrieve);
      });
    }
  };

  $scope.print = function() {
    CirculationStatisticsService.print()
    .then(function() {})
    .catch(function(error) {
      DialogService.showError(error.text, $scope.pageText.failedToPrint);
    });
  };

  $scope.done = function() {
    $location.path('staffMenu');
  };

  $scope.openToDatePicker = function() {
    $scope.datePickers.to.isOpen = true;
  };

  $scope.openFromDatePicker = function() {
    $scope.datePickers.from.isOpen = true;
  };

  var setTransactionTypesText = function() {
    $scope.transactionTypes.forEach(function(type) {
      if (type.value === 'all') {
        type.label = $scope.pageText.typesAll;
      } else if (type.value === 'CKO') {
        type.label = $scope.pageText.typesCheckout;
      } else if (type.value === 'CKI') {
        type.label = $scope.pageText.typesCheckin;
      } else if (type.value === 'REN') {
        type.label = $scope.pageText.typesRenewal;
      }
    });
  };

  var setTransactionStatusText = function() {
    $scope.transactionStatuses.forEach(function(status) {
      if (status.value === 'OK') {
        status.label = $scope.pageText.statusSuccessful;
      } else if (status.value === 'FAILED') {
        status.label = $scope.pageText.statusFailed;
      }
    });
  };

  var setMediaTypesText = function() {
    $scope.mediaTypes.forEach(function(type) {
      switch (type.value) {
        case 'all': type.label = $scope.pageText.mediaTypesAll; break;
        case '0': type.label = $scope.pageText.mediaTypesOther; break;
        case '1': type.label = $scope.pageText.mediaTypesBook; break;
        case '2': type.label = $scope.pageText.mediaTypesMagazine; break;
        case '3': type.label = $scope.pageText.mediaTypesBoundJournal; break;
        case '4': type.label = $scope.pageText.mediaTypesAudioTape; break;
        case '5': type.label = $scope.pageText.mediaTypesVideoTape; break;
        case '6': type.label = $scope.pageText.mediaTypesCdRom; break;
        case '7': type.label = $scope.pageText.mediaTypesDiskette; break;
        case '8': type.label = $scope.pageText.mediaTypesBookWithDiskette; break;
        case '9': type.label = $scope.pageText.mediaTypesBookWithCdRom; break;
        case '10': type.label = $scope.pageText.mediaTypesBookWithAudioTape; break;
      }
    });
  };

  var setButtonText = function() {
    ButtonRowService.buttonRow.buttons[0].text = $scope.stats ? $scope.pageText.refreshButton : $scope.pageText.submitButton;
    ButtonRowService.buttonRow.buttons[1].text = $scope.pageText.printButton;
    ButtonRowService.buttonRow.buttons[2].text = $scope.pageText.doneButton;
  };

  var setPageText = function() {
    $scope.pageText = {
      header: LanguagesService.translate('CIRCULATION_STATISTICS_HEADER'),
      criteriaHeader: LanguagesService.translate('CIRCULATION_STATISTICS_CRITERIA_HEADER'),
      fromDate: LanguagesService.translate('CIRCULATION_STATISTICS_FROM_DATE'),
      toDate: LanguagesService.translate('CIRCULATION_STATISTICS_TO_DATE'),
      transactionStatus: LanguagesService.translate('CIRCULATION_STATISTICS_TRANSACTION_STATUS'),
      transactionType: LanguagesService.translate('CIRCULATION_STATISTICS_TRANSACTION_TYPE'),
      mediaType: LanguagesService.translate('CIRCULATION_STATISTICS_MEDIA_TYPE'),
      refreshButton: LanguagesService.translate('CIRCULATION_STATISTICS_REFRESH_BUTTON'),
      submitButton: LanguagesService.translate('CIRCULATION_STATISTICS_SUBMIT_BUTTON'),
      printButton: LanguagesService.translate('CIRCULATION_STATISTICS_PRINT_BUTTON'),
      doneButton: LanguagesService.translate('CIRCULATION_STATISTICS_DONE_BUTTON'),
      statusSuccessful: LanguagesService.translate('CIRCULATION_STATISTICS_STATUS_SUCCESSFUL'),
      statusFailed: LanguagesService.translate('CIRCULATION_STATISTICS_STATUS_FAILED'),
      typesAll: LanguagesService.translate('CIRCULATION_STATISTICS_TYPES_ALL'),
      typesCheckout: LanguagesService.translate('CIRCULATION_STATISTICS_TYPES_CHECK_OUT'),
      typesCheckin: LanguagesService.translate('CIRCULATION_STATISTICS_TYPES_CHECK_IN'),
      typesRenewal: LanguagesService.translate('CIRCULATION_STATISTICS_TYPES_RENEWAL'),
      mediaTypesAll: LanguagesService.translate('CIRCULATION_STATISTICS_MEDIA_TYPES_ALL'),
      mediaTypesOther: LanguagesService.translate('CIRCULATION_STATISTICS_MEDIA_TYPES_OTHER'),
      mediaTypesBook: LanguagesService.translate('CIRCULATION_STATISTICS_MEDIA_TYPES_BOOK'),
      mediaTypesMagazine: LanguagesService.translate('CIRCULATION_STATISTICS_MEDIA_TYPES_MAGAZINE'),
      mediaTypesBoundJournal: LanguagesService.translate('CIRCULATION_STATISTICS_MEDIA_TYPES_BOUND_JOURNAL'),
      mediaTypesAudioTape: LanguagesService.translate('CIRCULATION_STATISTICS_MEDIA_TYPES_AUDIO_TAPE'),
      mediaTypesVideoTape: LanguagesService.translate('CIRCULATION_STATISTICS_MEDIA_TYPES_VIDEO_TAPE'),
      mediaTypesCdRom: LanguagesService.translate('CIRCULATION_STATISTICS_MEDIA_TYPES_CD_ROM'),
      mediaTypesDiskette: LanguagesService.translate('CIRCULATION_STATISTICS_MEDIA_TYPES_DISKETTE'),
      mediaTypesBookWithDiskette: LanguagesService.translate('CIRCULATION_STATISTICS_MEDIA_TYPES_BOOK_WITH_DISKETTE'),
      mediaTypesBookWithCdRom: LanguagesService.translate('CIRCULATION_STATISTICS_MEDIA_TYPES_BOOK_WITH_CD_ROM'),
      mediaTypesBookWithAudioTape: LanguagesService.translate('CIRCULATION_STATISTICS_MEDIA_TYPES_BOOK_WITH_AUDIO_TAPE'),
      invalidDatesError: LanguagesService.translate('CIRCULATION_STATISTICS_INVALID_DATES_ERROR'),
      failedToRetrieve: LanguagesService.translate('CIRCULATION_STATISTICS_FAILED_TO_RETRIEVE_ERROR'),
      failedToPrint: LanguagesService.translate('CIRCULATION_STATISTICS_FAILED_TO_PRINT_ERROR')
    };

    setButtonText();
    setTransactionStatusText();
    setTransactionTypesText();
    setMediaTypesText();
  };

  var init = function() {

    ButtonRowService.reset();
    ButtonRowService.addButton(new ButtonRowButton({ text:'Submit', action: $scope.submit }));
    ButtonRowService.addButton(new ButtonRowButton({ text:'Print', action: $scope.print, visible: false, enabled: false }));
    ButtonRowService.addButton(new ButtonRowButton({ text:'Done', action: $scope.done }));

    $scope.transactionStatuses = [
      { label: 'OK', value: 'OK'},
      { label: 'Failed', value: 'FAILED' }
    ];

    $scope.transactionTypes = [
      { label: 'All', value: 'all'},
      { label: 'Checkouts', value: 'CKO' },
      { label: 'Checkins', value: 'CKI' },
      { label: 'Renewals', value: 'REN' }
    ];

    $scope.mediaTypes = [
      { label: 'All', value: 'all' },
      { label: 'Other', value: '0' },
      { label: 'Book', value: '1' },
      { label: 'Magazine', value: '2' },
      { label: 'Bound Journal', value: '3' },
      { label: 'Audio Tape', value: '4' },
      { label: 'Video Tape', value: '5' },
      { label: 'CD/CDROM', value: '6' },
      { label: 'Diskette', value: '7' },
      { label: 'Book with Diskette', value: '8' },
      { label: 'Book with CD', value: '9' },
      { label: 'Book with Audio Tape', value: '10' }
    ];
    setPageText();

    var today = new Date();

    $scope.datePickers = {
      from: {
        isOpen: false,
        options: {
          minMode: 'day',
          maxMode: 'day',
          showWeeks: false
        }
      },
      to: {
        isOpen: false,
        options: {
          minMode: 'day',
          maxMode: 'day',
          showWeeks: false
        }
      }
    };

    $scope.filters = {
      fromDate: new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0),
      toDate: new Date(today.getFullYear(), today.getMonth() + 1, 0, 0, 0, 0),
      transactionStatus: $scope.transactionStatuses[0],
      transactionType: $scope.transactionTypes[0],
      mediaType: $scope.mediaTypes[0]
    };

    $scope.$on('translations.received', function() {
      setPageText();
    });
  };
  init();
}]);
