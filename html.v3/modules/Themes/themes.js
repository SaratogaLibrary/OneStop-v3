// Copyright(c)2017-2018 EnvisionWare, Inc. - All Rights Reserved

angular.module('ewOneStop-Themes',
[
  'ngRoute',
  'ewOneStop-Preferences',
  'ewOneStop-PageLayout',
  'ewOneStop-Dialogs',
  'ewOneStop-Utilities',
  'ewOneStop-Languages'
])

.config([
  '$sceDelegateProvider',
function($sceDelegateProvider) {
  'use strict';

  $sceDelegateProvider.resourceUrlWhitelist(['**']);
}])

.controller('ThemesController',
[
  '$scope',
  '$route',
  '$interval',
  'LanguagesService',
  'PreferencesService',
  'PageLayoutService',
  'DialogService',
  'FeedService',
  'BooleanValue',
function($scope, $route, $interval, LanguagesService, PreferencesService, PageLayoutService, DialogService, FeedService, BooleanValue) {
  'use strict';

  var DEFAULT_LOGO_DISPLAY_STYLE = 'block',
      DEFAULT_PAGE_TITLE_HEADER_DISPLAY_STYLE = 'inline-block',
      HEADER_IMAGE_ROTATION_INTERVAL = 5,
      DEFAULT_LOGO_IMAGE_PATH = '/assets/images/logo.png',
      DEFAULT_LOGO_IMAGE_BACKGROUND = 'transparent',
      DEFAULT_MENU_BUTTON_STYLE = 'white',
      RSS_ITEM_CHARS_TO_SHOW = 400,
      RSS_MAX_ITEMS_TO_SHOW = 10,
      RSS_ROTATION_INTERVAL = 3000,
      SUPPORTED_THEMES = ['reading-classic', 'childrens-imaginative', 'seasons-fall', 'seasons-spring', 'seasons-summer', 'seasons-winter'],
      DEFAULT_THEME = 'reading-classic',
      THEME_HEADER_IMAGES = {
        'reading-classic': {
          'landscape': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg'
    	  	],
    	    'portrait': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg'
    	    ],
          'rss': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg'
          ]
    	  },
        'childrens-imaginative': {
          'landscape': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg',
            'image7.jpg'
          ],
          'portrait': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg',
            'image7.jpg'
          ],
          'rss': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg',
            'image7.jpg'
          ]
        },
        'seasons-fall': {
          'landscape': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg'
    	  	],
    	    'portrait': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg'
  	      ],
          'rss': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg'
          ]
  	    },
        'seasons-spring': {
          'landscape': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg'
    	  	],
    	    'portrait': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg'
  	      ],
          'rss': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg'
          ]
  	    },
        'seasons-summer': {
          'landscape': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg'
    	  	],
    	    'portrait': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg'
  	      ],
          'rss': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg'
          ]
  	    },
        'seasons-winter': {
          'landscape': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg'
    	  	],
    	    'portrait': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg'
  	      ],
          'rss': [
            'image1.jpg',
            'image2.jpg',
            'image3.jpg',
            'image4.jpg',
            'image5.jpg',
            'image6.jpg'
          ]
  	    }
      };

  //$scope.rssFeedSrc = "https://www.loc.gov/rss/pao/events.xml"
  //$scope.rssFeedSrc = "http://nj.evanced.info/acfpl/lib/eventsxml.asp?ag=&et=&lib=0&nd=30&feedtitle=Atlantic+City+Free+Public+Library%3CBR%3ESchedule+of+Events&dm=rss2&LangType=0";
  //$scope.rssFeedSrc = "https://www.lapl.org/rss/events";
  //$scope.rssFeedSrc = "https://www.nypl.org/feed/rss/events/today_adults";

  var getRSSItemTitle = function(s) {
    return decodeURI(s.replace(/<\/?[^>]+(>|$)/g, ''));
  };

  var getRSSItemDescription = function(s) {
    var description = s.replace(/<\/?[^>]+(>|$)/g, '');
    if (description.length > RSS_ITEM_CHARS_TO_SHOW) {
      description = description.substr(0, RSS_ITEM_CHARS_TO_SHOW) + '...';
    }
    return description;
  };

  var getRSSFeed = function() {
    if ($scope.rss.show && $scope.rss.feedSource) {
      $scope.rss.feed = [];
      FeedService.parseFeed($scope.rss.feedSource)
      .then(function(res) {
        if (res.data && res.data.items && res.data.items.length) {
          for (var i = 0; i < RSS_MAX_ITEMS_TO_SHOW; ++i) {
            $scope.rss.feed[i] = { title: getRSSItemTitle(res.data.items[i].title), description: getRSSItemDescription(res.data.items[i].description) };
          }
        }
      });
    }
  };

  var setRandomRSSevent = function() {
    if ($scope.rss.feed) {
      var events = $scope.rss.feed;
      $scope.rss.event = events[$scope.rss.eventIndex++];
      if ($scope.rss.eventIndex >= events.length) {
        $scope.rss.eventIndex = 0;
      }
    }
  };

  var setBrandingColors = function() {
    var color = PreferencesService.get('ThemeMenuButtonColor');
    if (color) {
      $scope.theme.primaryBrandingColor = color;
      $scope.theme.secondaryBrandingColor = color;
    } else {
      switch ($scope.theme.name) {
        case 'reading-classic':
          $scope.theme.primaryBrandingColor = '#745489';
          $scope.theme.secondaryBrandingColor = '#745489';
          break;
  	    case 'childrens-imaginative':
  	      $scope.theme.primaryBrandingColor = '#666';
  	      $scope.theme.secondaryBrandingColor = '#745489';
  	      break;
          /*
  	    case 'newsevents':
  	      $scope.theme.primaryBrandingColor = '#669DBD';
  	      $scope.theme.secondaryBrandingColor = '#669DBD';
  	      break;
          */
        default:
  	      $scope.theme.primaryBrandingColor = '#82B6CF';
  	      $scope.theme.secondaryBrandingColor = '#82B6CF';
  	  }
    }
    $scope.theme.menuButtonStyle.background = (isDefaultButtonStyle() ? $scope.theme.primaryBrandingColor : '#fefefe');
    if (isDefaultTheme()) {
      $scope.theme.pageTitleStyle.background = 'transparent';
      $scope.theme.pageTitleStyle.color = '#fff';
    } else {
      $scope.theme.pageTitleStyle.background = '#fff';
      $scope.theme.pageTitleStyle.color = $scope.theme.primaryBrandingColor;
    }
	};

  var populateHeaderImageCollection = function() {
    var dir = '/assets/images/themes/' + $scope.theme.name + '/',
        images;

    if (isBuiltInTheme()) {
      var imgSet = $scope.showRSSEventsOrCalloutImage ? 'rss' : $scope.orientation;
      images = THEME_HEADER_IMAGES[$scope.theme.name][imgSet];
      dir += imgSet + '/';
    } else {
      images = PreferencesService.get('ThemeHeaderImages').split(/\s*,\s*/);
    }

    for (var i = 0; i < images.length; ++i) {
      $scope.theme.headerImages.collection[i] = {
        src: dir + images[i],
        id: i
      };
    }
  };

  var getHeaderImageRotationInterval = function() {
    return (PreferencesService.get('ThemeHeaderImageRotationInterval') || HEADER_IMAGE_ROTATION_INTERVAL) * 1000;
  };

  var isDefaultTheme = function() {
    return $scope.theme.name === DEFAULT_THEME;
  };

  var isBuiltInTheme = function() {
    return (SUPPORTED_THEMES.indexOf($scope.theme.name.toLowerCase()) >= 0);
  };

  var isDefaultButtonStyle = function() {
    return (PreferencesService.get('ThemeMenuButtonStyle') || DEFAULT_MENU_BUTTON_STYLE) === DEFAULT_MENU_BUTTON_STYLE;
  };

  var init = function() {
    $scope.$on('translations.received', function() {
      $scope.pageText = {
        title: LanguagesService.translate('COMMON_APPLICATION_TITLE'),
        eventsHeader: LanguagesService.translate('COMMON_EVENTS_HEADER'),
        timeRemainingHeader: LanguagesService.translate('COMMON_TIME_REMAINING_HEADER')
      };
    });

    $scope.orientation = PageLayoutService.isLandscape() ? 'landscape' : 'portrait';
    if ($scope.orientation === 'landscape') {
      RSS_ITEM_CHARS_TO_SHOW = 200;
    }

    $scope.theme = {
      name: PreferencesService.get('ThemeName') || DEFAULT_THEME,
      headerImages: {
        collection: [],
        rotationInterval: getHeaderImageRotationInterval()
      },
      menuButtonStyle: {
        background: '',   // will be set when branding colors are set
        color: (isDefaultButtonStyle() ? '#fff' : '#222'),
        char: (isDefaultButtonStyle() ? 'W' : '')   // 'W' for white buttons (color bg, white icon) or '' (clear bg, color icon)
      },
      pageTitleStyle: {
        background: '',   // will be set when branding colors are set
        color: '',   // will be set when branding colors are set
      },
      logoImage: {
        path: PreferencesService.get('ThemeLogoImagePath') || DEFAULT_LOGO_IMAGE_PATH,
        background: PreferencesService.get('ThemeLogoImageBackground').toLowerCase() || DEFAULT_LOGO_IMAGE_BACKGROUND
      },
      logoDisplayStyle: PreferencesService.get('ThemeLogoDisplayStyle') || DEFAULT_LOGO_DISPLAY_STYLE,
      pageTitleHeaderDisplayStyle: PreferencesService.get('ThemePageTitleHeaderDisplayStyle') || DEFAULT_PAGE_TITLE_HEADER_DISPLAY_STYLE,
    };
    setBrandingColors();


    $scope.rss = {
      show: BooleanValue(PreferencesService.get('ThemeShowRSSFeed')),
      feedSource: PreferencesService.get('ThemeRSSFeedUrl'),
      eventIndex: 0,
      event: {
        title: '',
        description: ''
      }
    };

    $scope.calloutImage = {
      show: BooleanValue(PreferencesService.get('ThemeShowCalloutImage')),
      path: PreferencesService.get('ThemeCalloutImagePath')
    };

    $scope.$on('headerImage.pause', function() {
      $scope.theme.headerImages.rotationInterval = 0;
    });

    $scope.$on('headerImage.resume', function() {
      $scope.theme.headerImages.rotationInterval = getHeaderImageRotationInterval();
    });

    $scope.$on('route.change', function(event, args) {
      $scope.showRSSEventsOrCalloutImage = (!!($scope.rss.show || $scope.calloutImage.show)) && args.isInitialState;

      if ($scope.rss.show && $scope.calloutImage.show) {
        $scope.rss.columnWidth = 6;
        $scope.rss.offset = '';
        $scope.calloutImage.columnWidth = 6;
      } else if ($scope.rss.show) {
        $scope.rss.columnWidth = 10;
        $scope.rss.offset = 'col-sm-offset-1';
        $scope.calloutImage.columnWidth = 0;
      } else if ($scope.calloutImage.show) {
        $scope.rss.columnWidth = 0;
        $scope.rss.offset = '';
        $scope.calloutImage.columnWidth = 12;
      }

      $scope.newsEventsLandscapeCol = PageLayoutService.isLandscape() && $scope.showRSSEventsOrCalloutImage ? 'col-sm-6' : '';
      if ($scope.rss.show) {
        getRSSFeed();
        setRandomRSSevent();
        $interval(setRandomRSSevent, RSS_ROTATION_INTERVAL);
      }

      populateHeaderImageCollection();
    });

  };
  init();
}])

.factory('FeedService', [
  '$http',
function($http){
  'use strict';

    return {
      parseFeed : function(url) {
        /* TODO: Verify that it will be acceptable to make a call to the Internet
                  (the RSS feed source could be located on the local network, so
                  direct access to the Internet cannot be guaranteed)
        */
        return $http.jsonp('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(url));
      }
    };
}]);
