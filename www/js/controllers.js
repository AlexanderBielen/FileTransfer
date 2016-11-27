angular.module('app.controllers', [])

.controller('myFilesCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('settingsCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('loginCtrl', ['$scope', '$stateParams', // The following is the constructor function for this page's controller. See https://docs.angularjs.org/guide/controller
// You can include any angular dependencies as parameters for this function
// TIP: Access Route Parameters for your page via $stateParams.parameterName
function ($scope, $stateParams) {


}])

.controller('FileTransferController',function($scope, $cordovaFileTransfer, $ionicActionSheet, $ionicPopup, $window, $ionicLoading, ShareService, GlobalVars) {

  $scope.UploadFile = function (file) {
    $scope.data = {};

    var myPopup = $ionicPopup.show({
      template: '<input type="text" ng-model="data.user">',
      title: 'Share with...',
      subTitle: 'Enter a username',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Share</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.user) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              return $scope.data.user;
            }
          }
        }
      ]
    });

    myPopup.then(function(res) {
      if(res != null) {
        ShareService.shareFile(file, $scope.data.user).success(function(data) {
          // Destination URL
          var url = GlobalVars.getServerUrl()+GlobalVars.getUploadPath()+"upload.php";
          //File for Upload
          var targetPath = file.toURL(); //cordova.file.dataDirectory + "logo_radni.png";
          // File name only
          var filename = file.name;//targetPath.split("/").pop();
          console.debug(targetPath);
          console.debug(filename);
          var options = {
            fileKey: "file",
            fileName: filename,
            chunkedMode: false,
            mimeType: "image/jpg",
            params: {'directory': '../upload', 'fileName': filename} // directory represents remote directory,  fileName represents final remote file name
          };
          $ionicLoading.show({
            template: 'Uploading'
          });
          $cordovaFileTransfer.upload(url, targetPath, options).then(function (result) {
            if (result.response == "UploadOK") {
              alert('File uploaded');
            }
            console.log("SUCCESS: " + JSON.stringify(result.response));
            $ionicLoading.hide();
          }, function (err) {
            console.log("ERROR: " + JSON.stringify(err));
            $ionicLoading.hide();
          }, function (progress) {
            var prog = progress.loaded / progress.total;
            prog = Math.round(prog * 100);
            $ionicLoading.show({template: 'Uploading '+prog+'%'});
          });
          alert('File has been shared');
        }).error(function(data) {
          var alertPopup = $ionicPopup.alert({
            title: 'Error',
            template: 'Failed to share file!'
          });
        });

      }
    });
  };

  $scope.showActionSheet = function(file) {

    // Show the action sheet
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: '<b>Share</b>' }
      ],
      destructiveText: 'Delete',
      titleText: file.name,
      cancelText: 'Cancel',
      cancel: function() {
        return true;
      },
      buttonClicked: function(index) {
        if(index == 0) {
          $scope.UploadFile(file);
        }
        return true;
      },
      destructiveButtonClicked: function() {
        $scope.showConfirm(file);
        return true;
      }
    });

    $scope.showConfirm = function(file) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Remove '+file.name,
        template: 'Are you sure you want to delete this file?'
      });

      confirmPopup.then(function(res) {
        if(res) {
          file.remove(function (entry){
            console.log('File removed');
            $window.location.reload(true)
          }, function(error){
            alert('Error removing file: ' + error.code);
          });
        }
      });
    };
  };
})

  .controller('LoginCtrl', function($scope, LoginService, $ionicPopup, $state) {
    $scope.data = {};

    $scope.login = function() {
      LoginService.loginUser($scope.data.username, $scope.data.password).success(function(data) {
        $state.go('tabsController.myFiles');
      }).error(function(data) {
        var alertPopup = $ionicPopup.alert({
          title: 'Login failed!',
          template: 'Please check your credentials!'
        });
      });
    }
  })

.controller('sharedCtrl', function($scope, $rootScope, $cordovaFileTransfer, SharedService, $ionicPopup, $ionicLoading, GlobalVars, $ionicActionSheet) {
$scope.files = [];
  $scope.load = function () {
    $scope.files = [];
    SharedService.getSharedFiles(GlobalVars.getUsername()).success(function(data) {
      data.forEach(function(element) {
        $scope.files.push(element);
        $scope.$broadcast('scroll.refreshComplete');
      });
    }).error(function(data) {
      var alertPopup = $ionicPopup.alert({
        title: 'Error',
        template: 'Failed to retrieve shared files'
      });
    });
  };
  $scope.load();
  $scope.DownloadFile = function (file) {
    // File for download
    var url = "http://www.gajotres.net/wp-content/uploads/2015/04/logo_radni.png";
    url = GlobalVars.getServerUrl()+GlobalVars.getUploadPath() + file.filename;

// File name only
    var filename = file.filename;

// Save location
    var targetPath = cordova.file.dataDirectory + filename;

    $ionicLoading.show({
      template: 'Downloading'
    });

    $cordovaFileTransfer.download(url, targetPath, {}, true).then(function (result) {
      $ionicLoading.hide();
      var alertPopup = $ionicPopup.alert({
        title: 'Downloaded',
        template: 'This file has been saved to your system'
      });
    }, function (error) {
      $ionicLoading.hide();
      console.log('Error');
    }, function (progress) {
      var prog = progress.loaded / progress.total;
      prog = Math.round(prog * 100);
      $ionicLoading.show({template: 'Downloading '+prog+'%'});
    });
  };
  $scope.showActionSheet = function(file) {

    // Show the action sheet
    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: '<b>Download</b>' }
      ],
      titleText: file.filename,
      cancelText: 'Cancel',
      cancel: function() {
        return true;
      },
      buttonClicked: function(index) {
        if(index == 0) {
          $scope.DownloadFile(file);
        }
        return true;
      }
    });
  };
});
