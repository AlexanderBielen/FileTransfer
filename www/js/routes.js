angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider



      .state('tabsController.myFiles', {
    url: '/files',
    views: {
      'tab1': {
        templateUrl: 'templates/myFiles.html',
        controller: 'FileTransferController'
      }
    }
  })

    .state('tabsController.shared', {
      url: '/shared',
      views: {
        'tab3': {
          templateUrl: 'templates/shared.html',
          controller: 'sharedCtrl'
        }
      }
    })

  .state('tabsController.settings', {
    url: '/settings',
    views: {
      'tab4': {
        templateUrl: 'templates/settings.html',
        controller: 'settingsCtrl'
      }
    }
  })

    .state('tabsController.gallery', {
      url: '/gallery',
      views: {
        'tab2': {
          templateUrl: 'templates/gallery.html',
          controller: 'galleryCtrl'
        }
      }
    })

  .state('tabsController', {
    url: '/page1',
    templateUrl: 'templates/tabsController.html',
    abstract:true
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  .state('signup', {
    url: '/signup',
    templateUrl: 'templates/signup.html',
    controller: 'signupCtrl'
  });
  $urlRouterProvider.otherwise('/login')

});
