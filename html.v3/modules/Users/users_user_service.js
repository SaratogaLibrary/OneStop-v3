// Copyright(c)2017-2018 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Users')

// See https://medium.com/opinionated-angularjs/angular-model-objects-with-javascript-classes-2e6a067c73bc
.factory('User',
[
  'Item',
  'FineItem',
  'Defaults',
  'LanguageCodesService',
  'BooleanValue',
  'ObjectProperty',
function(Item, FineItem, Defaults, LanguageCodesService, BooleanValue, ObjectProperty) {
  'use strict';

  var User = function(data) {
    this.id = ObjectProperty(data, 'id', '');
    this.pin = ObjectProperty(data, 'pin', '');
    this.fullName = ObjectProperty(data, 'fullName', '');
    this.valid = ObjectProperty(data, 'valid', 'No');
    this.validPassword = ObjectProperty(data, 'validPassword', 'No');
    this.feeAmount = ObjectProperty(data, 'feeAmount', 0);
    this.feeOwed = ObjectProperty(data, 'feeOwed', 'No');
    this.feeLimit = ObjectProperty(data, 'feeLimit', 0);
    this.chargePrivilegesDenied = ObjectProperty(data, 'chargePrivilegesDenied', '');
    this.renewalPrivilegesDenied = ObjectProperty(data, 'renewalPrivilegesDenied', '');
    this.recallPrivilegesDenied = ObjectProperty(data, 'recallPrivilegesDenied', '');
    this.holdPrivilegesDenied = ObjectProperty(data, 'holdPrivilegesDenied', '');
    this.cardReportedLost = ObjectProperty(data, 'cardReportedLost', '');
    this.tooManyItemsCharged = ObjectProperty(data, 'tooManyItemsCharged', '');
    this.tooManyItemsOverdue = ObjectProperty(data, 'tooManyItemsOverdue', '');
    this.tooManyRenewals = ObjectProperty(data, 'tooManyRenewals', '');
    this.tooManyClaimsOfItemsReturned = ObjectProperty(data, 'tooManyClaimsOfItemsReturned', '');
    this.tooManyItemsLost = ObjectProperty(data, 'tooManyItemsLost', '');
    this.excessiveOutstandingFines = ObjectProperty(data, 'excessiveOutstandingFines', '');
    this.excessiveOutstandingFees = ObjectProperty(data, 'excessiveOutstandingFees', '');
    this.recallOverdue = ObjectProperty(data, 'recallOverdue', '');
    this.tooManyItemsBilled = ObjectProperty(data, 'tooManyItemsBilled', '');
    this.language = ObjectProperty(data, 'language', Defaults.LANGUAGE);
    this.currencyType = ObjectProperty(data, 'currencyType', Defaults.CURRENCY_TYPE);
    this.homeAddress = ObjectProperty(data, 'homeAddress', '');
    this.emailAddress = ObjectProperty(data, 'emailAddress', '');
    this.homePhoneNumber = ObjectProperty(data, 'homePhoneNumber', '');
    this.screenMessage = ObjectProperty(data, 'screenMessage', '');
    this.printLine = ObjectProperty(data, 'printLine', '');
    this.holdItemsCount = Number(ObjectProperty(data, 'holdItemsCount', 0));
    this.holdItemsLimit = Number(ObjectProperty(data, 'holdItemsLimit', 0));
    this.overdueItemsCount = Number(ObjectProperty(data, 'overdueItemsCount', 0));
    this.overdueItemsLimit = Number(ObjectProperty(data, 'overdueItemsLimit', 0));
    this.chargedItemsCount = Number(ObjectProperty(data, 'chargedItemsCount', 0));
    this.chargedItemsLimit = Number(ObjectProperty(data, 'chargedItemsLimit', 0));
    this.fineItemsCount = Number(ObjectProperty(data, 'fineItemsCount', 0));
    this.recallItemsCount = Number(ObjectProperty(data, 'recallItemsCount', 0));
    this.unavailableHoldsCount = Number(ObjectProperty(data, 'unavailableHoldsCount', 0));


    var splitItemDetails = function(s) {
      if (s) {
        return s.split(';');
      }
      return [];
    };

    var processItemDetails = function(ItemType, details) {
      var items = splitItemDetails(details),
          container = [];
      if (items.length) {
        container = items.map(function(item) {
          return new ItemType(item);
        });
      }
      return container;
    };

    this.holdItems = processItemDetails(Item, ObjectProperty(data, 'holdItems', ''));
    this.overdueItems = processItemDetails(Item, ObjectProperty(data, 'overdueItems', ''));
    this.chargedItems = processItemDetails(Item, ObjectProperty(data, 'chargedItems', ''));
    this.recallItems = processItemDetails(Item, ObjectProperty(data, 'recallItems', ''));
    this.unavailableHolds = processItemDetails(Item, ObjectProperty(data, 'unavailableHolds', ''));
    this.fineItems = processItemDetails(FineItem, ObjectProperty(data, 'fineItems', ''));
  };

  User.prototype.isValid = function() { return BooleanValue(this.valid); };
  User.prototype.hasValidPassword = function() { return BooleanValue(this.validPassword); };
  User.prototype.owesFee = function() { return BooleanValue(this.feeOwed); };
  User.prototype.hasChargePrivileges = function() { return !BooleanValue(this.chargePrivilegesDenied); };
  User.prototype.hasRenewalPrivileges = function() { return !BooleanValue(this.renewalPrivilegesDenied); };
  User.prototype.hasRecallPrivileges = function() { return !BooleanValue(this.recallPrivilegesDenied); };
  User.prototype.hasHoldPrivileges = function() { return !BooleanValue(this.holdPrivilegesDenied); };
  User.prototype.isCardReportedLost = function() { return BooleanValue(this.cardReportedLost); };
  User.prototype.hasTooManyItemsCharged = function() { return BooleanValue(this.tooManyItemsCharged); };
  User.prototype.hasTooManyItemsOverdue = function() { return BooleanValue(this.tooManyItemsOverdue); };
  User.prototype.hasTooManyRenewals = function() { return BooleanValue(this.tooManyRenewals); };
  User.prototype.hasTooManyClaimsOfItemsReturned = function() { return BooleanValue(this.tooManyClaimsOfItemsReturned); };
  User.prototype.hasTooManyItemsLost = function() { return BooleanValue(this.tooManyItemsLost); };
  User.prototype.hasExcessiveOutstandingFines = function() { return BooleanValue(this.excessiveOutstandingFines); };
  User.prototype.hasExcessiveOutstandingFees = function() { return BooleanValue(this.excessiveOutstandingFees); };
  User.prototype.hasRecallOverdue = function() { return BooleanValue(this.recallOverdue); };
  User.prototype.hasTooManyItemsBilled = function() { return BooleanValue(this.tooManyItemsBilled); };
  User.prototype.getLanguageCode = function() { return LanguageCodesService.getLanguageCode(this.language); };

  User.create = function(data) {
    return new User(data);
  };

  return User;
}]);
