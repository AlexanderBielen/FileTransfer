// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js

angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.directives','app.services','ngCordova' ,'ion-gallery'])

.config(function($ionicConfigProvider, $sceDelegateProvider){



  $sceDelegateProvider.resourceUrlWhitelist([ 'self','*://www.youtube.com/**', '*://player.vimeo.com/video/**', '*://filetransfer.alxb.be/**']);

})

  .config( [
    '$compileProvider',
    function( $compileProvider )
    {
      $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|file|blob|cdvfile|content):|data:image\//);
    }
  ])

.run(function($ionicPlatform, $ionicPopup) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)

    if(window.Connection) {
      if(navigator.connection.type == Connection.NONE) {
        $ionicPopup.confirm({
          title: "No internet",
          content: "This app requires an internet connection, please enable it."
        }).then(function(result) {
          if(!result) {
            ionic.Platform.exitApp();
          }
        });
      }
    }

    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.directive('disableSideMenuDrag', ['$ionicSideMenuDelegate', '$rootScope', function($ionicSideMenuDelegate, $rootScope) {
    return {
        restrict: "A",
        controller: ['$scope', '$element', '$attrs', function ($scope, $element, $attrs) {

            function stopDrag(){
              $ionicSideMenuDelegate.canDragContent(false);
            }

            function allowDrag(){
              $ionicSideMenuDelegate.canDragContent(true);
            }

            $rootScope.$on('$ionicSlides.slideChangeEnd', allowDrag);
            $element.on('touchstart', stopDrag);
            $element.on('touchend', allowDrag);
            $element.on('mousedown', stopDrag);
            $element.on('mouseup', allowDrag);

        }]
    };
}])

  .factory("$fileFactory", function($q, $ionicHistory) {

    var File = function() { };

    File.prototype = {

      getParentDirectory: function(path) {
        var deferred = $q.defer();
        window.resolveLocalFileSystemURL(path, function(fileSystem) {
          fileSystem.getParent(function(result) {
            deferred.resolve(result);
          }, function(error) {
            deferred.reject(error);
          });
        }, function(error) {
          deferred.reject(error);
        });
        return deferred.promise;
      },

      getEntriesAtRoot: function() {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        var deferred = $q.defer();
        window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, function(fileSystem) {
          var directoryReader = fileSystem.root.createReader();
          directoryReader.readEntries(function(entries) {
            deferred.resolve(entries);
          }, function(error) {
            deferred.reject(error);
            console.error("filesystem error: "+error.message);
          });
        }, function(error) {
          console.error(error);
          deferred.reject(error);
        });
        return deferred.promise;
      },

      getEntries: function(path) {
        var deferred = $q.defer();
        window.resolveLocalFileSystemURL(path, function(fileSystem) {
          var directoryReader = fileSystem.createReader();
          directoryReader.readEntries(function(entries) {
            deferred.resolve(entries);
          }, function(error) {
            console.error(error);
            deferred.reject(error);
          });
        }, function(error) {
          console.error(error);
          deferred.reject(error);
        });
        return deferred.promise;
      }

    };

    return File;

  })

  .controller("LocalFileBrowser", function($scope, $ionicPlatform, $fileFactory) {
      var fs = new $fileFactory();
      $ionicPlatform.ready(function () {
        $scope.currentDir = cordova.file.applicationStorageDirectory+"cache/"; // Zorgen dat er altijd iets in currentDir zit
        fs.getEntriesAtRoot().then(function (result) {
          $scope.files = result;
          $scope.$broadcast('scroll.refreshComplete');
        }, function (error) {
          console.error(error);
        });

        $scope.getContents = function (path) {
          $scope.currentDir = path;
          console.log(path);
          fs.getEntries(path).then(function (result) {
            $scope.files = result;
            $scope.files.unshift({name: "[parent]"});
            fs.getParentDirectory(path).then(function (result) {
              result.name = "[parent]";
              $scope.files[0] = result;
            }, function (error) {
              console.error(error);
            });
          }, function (error) {
            console.error(error);
          });
          $scope.$broadcast('scroll.refreshComplete');
        };
      });
  });
