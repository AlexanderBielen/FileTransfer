angular.module('app.controllers', [])

  .controller('FileTransferController',function($scope, $cordovaFileTransfer, $ionicActionSheet, $ionicPopup, $window, $ionicLoading, ShareService, GlobalVars) {

  $scope.UploadFile = function (file) {
    $scope.data = {};

    var askUser = $ionicPopup.show({
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
              e.preventDefault();
            } else {
              return $scope.data.user;
            }
          }
        }
      ]
    });

    askUser.then(function(res) {
      if(res != null) {
        ShareService.shareFile(file.name, $scope.data.user).success(function(data) {
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
            alert('File has been shared');
          }, function (err) {
            console.log("ERROR: " + JSON.stringify(err));
            $ionicLoading.hide();
          }, function (progress) {
            var prog = progress.loaded / progress.total;
            prog = Math.round(prog * 100);
            $ionicLoading.show({template: 'Uploading '+prog+'%'});
          });
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
          }, function(error){
            alert('Error removing file: ' + error.code);
          });
        }
      });
    };
  };
})

  .controller('LoginCtrl', function($scope, LoginService, $ionicPopup, $state, $ionicHistory, sessionService) {
    if(sessionService.get('username') != null) {
      $state.go('tabsController.myFiles',null, {location: 'replace'});
    }

    $scope.data = {};
    $scope.register=function () {
      $state.go('signup');
    };

    $scope.login = function() {
      LoginService.loginUser($scope.data.username, $scope.data.password).success(function(data) {
        $ionicHistory.currentView($ionicHistory.backView());
        $state.go('tabsController.myFiles',null, {location: 'replace'});
      }).error(function(data) {
        var alertPopup = $ionicPopup.alert({
          title: 'Login failed!',
          template: 'Please check your credentials!'
        });
      });
    }
  })

.controller('sharedCtrl', function($scope, $rootScope, $cordovaFileTransfer, SharedService, $ionicPopup, $ionicLoading, GlobalVars, $ionicActionSheet, sessionService, $http) {
$scope.files = [];
  $scope.load = function () {
    $scope.files = [];
    if(sessionService.get('username') == null) {
      $scope.$broadcast('scroll.refreshComplete');
    }
    GlobalVars.clearImageUrl();
    SharedService.getSharedFiles(sessionService.get('username')).success(function(data) {
      data.forEach(function(element) {
        GlobalVars.addImageUrl(element.filename);
        $scope.files.push(element);
        $scope.$broadcast('scroll.refreshComplete');
      });
    }).error(function(data) {
      var alertPopup = $ionicPopup.alert({
        title: 'Error',
        template: 'Failed to retrieve shared files: ' + data
      });
    });
  };
  $scope.load();
  $scope.DownloadFile = function (file) {
    // File for download
    url = GlobalVars.getServerUrl()+GlobalVars.getUploadPath() + file.filename;

    var filename = file.filename;

    var extension = file.filename.split(".").pop();

    var targetPath = cordova.file.dataDirectory + filename;

    if(extension == "jpg") {
      targetPath = cordova.file.dataDirectory + "pictures/" + filename;
      console.log("Saving in pictures");
    }

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
  $scope.shouldShowDelete = false;
  $scope.remove = function(file) {
    var link = "http://filetransfer.alxb.be/upload/remove.php?username=test&filename="+file.filename;
    $http.get(link).success(function (data) {
      if(data.status == "ok") {
        console.log('success');
      } else {
        console.log('Failed to remove file');
      }
    }).error(function (data) {
      console.log('Failed to remove file');
    });
    $scope.load();
  };
})

.controller('settingsCtrl', function($scope, sessionService, $ionicHistory, $state, $window) {
  $scope.signOut = function(){
    sessionService.destroy('username');
    $ionicHistory.currentView($ionicHistory.backView());
    $state.go('login',null, {location: 'replace'});
    $window.location.reload(true); // Full reset
  }
})
.controller('signupCtrl', function(signupService, $scope, $ionicPopup, $state) {
  $scope.data = {};
  $scope.register = function() {
    signupService.registerUser($scope.data.username, $scope.data.password).success(function(data) {
      console.log(data);
      var alertPopup = $ionicPopup.alert({
        title: 'Success!',
        template: 'You just registered!'
      });
      $state.go('login');
    }).error(function(data) {
      var alertPopup = $ionicPopup.alert({
        title: 'Signup failed!',
        template: 'Error '+data
      });
    });
  }
})

.controller('galleryCtrl', function($scope, $cordovaImagePicker, $ionicPlatform, $cordovaCamera, $ionicLoading, $ionicPopup, ShareService, GlobalVars, $cordovaFileTransfer, $ionicHistory, $state) {
  $scope.items = [];
  $scope.sharePicture = function(option) {
    var options;
    switch(option) {
      case 'camera':
        options = {
          quality: 75,
          destinationType: Camera.DestinationType.NATIVE_URI,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: false,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 300,
          targetHeight: 300,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: true
        };
        break;
      case 'gallery':
        options = {
          quality: 75,
          destinationType: Camera.DestinationType.NATIVE_URI,
          sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
          allowEdit: true,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 300,
          targetHeight: 300,
          popoverOptions: CameraPopoverOptions,
        };
        break;
    }
    $scope.data = {};
    var askUser = $ionicPopup.show({
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
              e.preventDefault();
            } else {
              return $scope.data.user;
            }
          }
        }
      ]
    });

    askUser.then(function(res) {
      if(res != null) {
        $cordovaCamera.getPicture(options).then(function (imageData) {
          console.log(imageData.toURL());
          console.log(imageData.fullPath);
          console.log(imageData.name);
          var targetPath = imageData;
          var filename = targetPath.split("/").pop();
          ShareService.shareFile(filename, $scope.data.user).success(function(data) {
            var url = GlobalVars.getServerUrl()+GlobalVars.getUploadPath()+"upload.php";

            console.debug(targetPath);
            console.debug(filename);
            var options = {
              fileKey: "file",
              fileName: filename,
              chunkedMode: false,
              mimeType: "image/jpg",
              params: {'directory': '../upload', 'fileName': filename}
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
              img = [{
                src:imageData,
                sub: ''
              }];
              $scope.items.push(img);
              alert('File has been shared');
            }, function (err) {
              console.log("ERROR: " + JSON.stringify(err));
              $ionicLoading.hide();
            }, function (progress) {
              var prog = progress.loaded / progress.total;
              prog = Math.round(prog * 100);
              $ionicLoading.show({template: 'Uploading '+prog+'%'});
            });
          }).error(function(data) {
            var alertPopup = $ionicPopup.alert({
              title: 'Error',
              template: 'Failed to share file!'
            });
          });
        }, function (err) {
          console.log(err);
        });
      }
    });
  };
  $scope.loadGallery = function() {
    $scope.items = [];
    getPictures(cordova.file.dataDirectory + "pictures/");
    var images = GlobalVars.getImageUrls();
    images.forEach(function(item) {
      $scope.items.push({
        src: GlobalVars.getServerUrl()+GlobalVars.getUploadPath()+item,
        sub: GlobalVars.getServerUrl()+GlobalVars.getUploadPath()+item
      });
    });
    $scope.$broadcast('scroll.refreshComplete');
  };
  $ionicPlatform.ready(function() {
    $scope.loadGallery();
  });
$scope.f = function (f) {
  alert(f);
};
  function getPictures(path){
    window.resolveLocalFileSystemURL(path,
      function (fileSystem) {
        var reader = fileSystem.createReader();
        reader.readEntries(
          function (entries) {
            entries.forEach(function (file) {
              var t = cordova.file.dataDirectory + "pictures/" + file.name;
              t = t.replace("file://", "");
              console.log(t);
              $scope.items.push(
                {
                  src: t,
                  sub: ""
                },
                {
                  src: ".."+file.fullPath,
                  sub: ""
                }
              );
              console.log(file.name);
              console.log(file.fullPath);
              console.log(file.toURL());
            });
          },
          function (err) {
            console.log(err);
            return false;
          }
        );
      }, function (err) {
        console.log(err);
        return false;
      }
    );
  }
});
