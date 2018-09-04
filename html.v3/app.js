// Copyright(c)2016 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop',
[
  'ngRoute',
  'ngSanitize',
  'ngAnimate',
  'ewOneStop-Menu',
  'ewOneStop-Login',
  'ewOneStop-Checkout',
  'ewOneStop-Checkin',
  'ewOneStop-Users',
  'ewOneStop-ButtonRow',
  'ewOneStop-Themes',
  'ewOneStop-Languages',
  'ewOneStop-Start',
  'ewOneStop-PageTimeout',
  'ewOneStop-StaffFunctions',
  'ewOneStop-HelpRequests',
  'ewOneStop-PendingAlerts',
  'ewOneStop-Keyboard',
  'ewOneStop-Languages',
  'ewOneStop-CirculationStatistics',
  'ewOneStop-PleaseWait'
])

.run(
[
  '$rootScope',
  '$timeout',
  'StartService',
  'PageTimeoutService',
  'LanguagesService',
  'PleaseWaitService',
function($rootScope, $timeout, StartService, PageTimeoutService, LanguagesService, PleaseWaitService) {
  'use strict';

  LanguagesService.getDefaultPageText()
  .then(function() {
    $rootScope.$broadcast('translations.received', {});
  });

  $rootScope.$on('$routeChangeSuccess', function(event, current /*, previous */) {
    PageTimeoutService.stopInactivityTimer();
    PleaseWaitService.setWaiting(false);
    
    $rootScope.$broadcast('headerImage.pause', {});
    if (current && current.originalPath) {
      $timeout(function() {
        $rootScope.$broadcast('route.change', { isInitialState: StartService.isInitialState(current.originalPath) });
      }, 0);
    }
  });
}])

.config(['$routeProvider', function($routeProvider) {
  'use strict';

  $routeProvider
  .when('/menu', {
    templateUrl: 'modules/Menu/menu.tmpl.html',
    controller: 'MenuController',
    reloadOnSearch: false
  })
  .when('/login', {
    templateUrl: 'modules/Login/enterUserId.tmpl.html',
    controller: 'EnterUserIdController',
    reloadOnSearch: false
  })
  .when('/enterPin', {
    templateUrl: 'modules/Login/enterPin.tmpl.html',
    controller: 'EnterPinController',
    reloadOnSearch: false
  })
  .when('/checkout', {
    templateUrl: 'modules/Checkout/checkout.tmpl.html',
    controller: 'CheckoutController',
    reloadOnSearch: false
  })
  .when('/myAccount', {
    templateUrl: 'modules/Users/myAccount.tmpl.html',
    controller: 'MyAccountController',
    reloadOnSearch: false
  })
  .when('/checkin', {
    templateUrl: 'modules/Checkin/checkin.tmpl.html',
    controller: 'CheckinController',
    reloadOnSearch: false
  })
  .when('/staffMenu', {
    templateUrl: 'modules/StaffFunctions/staffMenu.tmpl.html',
    controller: 'StaffMenuController',
    reloadOnSearch: false
  })
  .when('/pendingAlerts', {
    templateUrl: 'modules/PendingAlerts/pendingAlerts.tmpl.html',
    controller: 'PendingAlertsController',
    reloadOnSearch: false
  })
  .when('/viewStatistics', {
    templateUrl: 'modules/CirculationStatistics/circulationStatistics.tmpl.html',
    controller: 'CirculationStatisticsController',
    reloadOnSearch: false
  })
  .otherwise({
    template: ' ',                // See https://weblog.west-wind.com/posts/2013/Oct/15/Routing-to-a-Controller-with-no-View-in-Angular
    controller: 'StartController'
  });
}])

.config(['$httpProvider', function($httpProvider) {
  'use strict';

  // See: http://stackoverflow.com/questions/16098430/angular-ie-caching-issue-for-http
  $httpProvider.defaults.headers.get = $httpProvider.defaults.headers.get || {};

  /*jshint -W069 */
  //disable IE ajax request caching
  $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';
  $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
  $httpProvider.defaults.headers.get['Pragma'] = 'no-cache';
  /*jshint +W069 */
}])

/* global angular */
/**
 * https://gist.github.com/mlynch/dd407b93ed288d499778
 *
 * the HTML5 autofocus property can be finicky when it comes to dynamically
 * loaded templates and such with AngularJS. Use this simple directive to tame
 * this beast once and for all.
 *
 * Usage:
 * <input type="text" autofocus>
 */
.directive('autofocus',
['$timeout',
  /* istanbul ignore next */
  function ($timeout) {
    'use strict';

    return {
      restrict: 'A',
      link: function ($scope, $element) {
        $timeout(function () {
          $element[0].focus();
        });
      }
    };
  }
]);
