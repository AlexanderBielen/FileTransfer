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
        controller: 'myFilesCtrl'
      }
    }
  })

    .state('tabsController.shared', {
      url: '/shared',
      views: {
        'tab2': {
          templateUrl: 'templates/shared.html',
          controller: 'sharedCtrl'
        }
      }
    })

  .state('tabsController.settings', {
    url: '/settings',
    views: {
      'tab3': {
        templateUrl: 'templates/settings.html',
        controller: 'settingsCtrl'
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
  $urlRouterProvider.otherwise('/login')
//$urlRouterProvider.otherwise('/page1/files')



});
