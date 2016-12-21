angular.module('app.controllers', [])

  .controller('FileTransferController',function($scope, $cordovaFileTransfer, $ionicActionSheet, $ionicPopup, $window, $ionicLoading, ShareService, GlobalVars) {

    // Geef een file mee voor te uploaden
  $scope.UploadFile = function (file) {
    $scope.data = {};

    // Aan de user een gebruikersnaam vragen voor het bestand te delen
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

    askUser.then(function(res) { // Na het vragen aan de user
      if(res != null) {
        ShareService.shareFile(file.name, $scope.data.user, false).success(function(data) {

          var url = GlobalVars.getServerUrl()+GlobalVars.getUploadPath()+"upload.php"; // Upload directory samenstellen

          var targetPath = file.toURL();

          var filename = file.name;
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
              var alertPopup = $ionicPopup.alert({
                title: 'File uploaded!',
                template: 'The file has been uploaded and shared!'
              });
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
        }).error(function(data) {
          var alertPopup = $ionicPopup.alert({
            title: 'Error',
            template: 'Failed to share file!'
          });
        });

      }
    });
  };

  //Action sheet met keuze uit delen en deleten van een bestand in de filebrowser
  $scope.showActionSheet = function(file) {

    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: '<i class="icon ion-share balanced"></i><b>Share</b>' }
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

    //Bevestiging voor het verwijderen van een file
    $scope.showConfirm = function(file) {
      var confirmPopup = $ionicPopup.confirm({
        title: 'Remove '+file.name,
        template: 'Are you sure you want to delete this file?'
      });

      //Na bevestiging, verwijder bestand
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

  //De controller die met de login pagina gelink is
  .controller('LoginCtrl', function($scope, LoginService, $ionicPopup, $state, $ionicHistory, sessionService) {
    if(sessionService.get('username') != null) {
      $state.go('tabsController.myFiles',null, {location: 'replace'});
    }

    $scope.data = {}; //In deze variabele komen username en passwoord
    $scope.register=function () { // Na het klikken op de knop signup
      $state.go('signup');
    };

    //Na het klikken op de login knop wordt deze functie uitgevoerd
    $scope.login = function() {
      LoginService.loginUser($scope.data.username, $scope.data.password).success(function(data) { // De login service contacteren
        $ionicHistory.currentView($ionicHistory.backView());
        $state.go('tabsController.myFiles',null, {location: 'replace'});
      }).error(function(data) { // Bij een foute login
        var alertPopup = $ionicPopup.alert({
          title: 'Login failed!',
          template: 'Please check your credentials!'
        });
      });
    }
  })

  // De controller gelinkt met de shared with me pagina
.controller('sharedCtrl', function($scope, $rootScope, $cordovaFileTransfer, SharedService, $ionicPopup, $ionicLoading, GlobalVars, $ionicActionSheet, sessionService, $http) {
$scope.files = [];
  $scope.load = function () { // Functie voor het ophalen en verwerken van gedeelde bestanden
    $scope.files = [];
    if(sessionService.get('username') == null) { // Controle of er wel een user is ingelogd
      $scope.$broadcast('scroll.refreshComplete');
    }
    SharedService.getSharedFiles(sessionService.get('username')).success(function(data) { // Alle bestanden van de server halen door de SharedService
      data.forEach(function(element) {
        $scope.files.push(element); // Loopen door bestanden en toevoegen aan array
      });
      $scope.$broadcast('scroll.refreshComplete');
    }).error(function(data) { // Error bij het ophalen
      var alertPopup = $ionicPopup.alert({
        title: 'Error',
        template: 'Failed to retrieve shared files: ' + data
      });
    });
  };
  $scope.load();

  // Wanneer er op download gedrukt wordt
  $scope.DownloadFile = function (file) {
    url = GlobalVars.getServerUrl()+GlobalVars.getUploadPath() + file.filename; // De url samenstellen voor het bestand te downloaden

    var filename = file.filename;

    var extension = file.filename.split(".").pop();

    var targetPath = cordova.file.applicationStorageDirectory + "cache/" + filename; // Waar het bestand opgeslaan wordt

    if(extension == "jpg") { // Wanneer het een jpg foto is wordt het ergens anders opgeslaan
      targetPath = cordova.file.applicationStorageDirectory + "cache/pictures/" + filename;
      console.log("Saving in pictures");
    }

    $ionicLoading.show({ // Toast voor tijdens het downloaden
      template: 'Downloading'
    });

    $cordovaFileTransfer.download(url, targetPath, {}, true).then(function (result) {
      $ionicLoading.hide();
      var alertPopup = $ionicPopup.alert({
        title: 'Downloaded',
        template: 'This file has been saved to your system'
      });
    }, function (error) { // Wanneer het downloaden mislukt
      $ionicLoading.hide();
      console.log('Error: '+JSON.stringify(error));
    }, function (progress) { // Progress tijdens het downloaden laten zien
      var prog = progress.loaded / progress.total;
      prog = Math.round(prog * 100);
      $ionicLoading.show({template: 'Downloading '+prog+'%'});
    });
  };
  // Actionsheet wanneer er op een file geklikt wordt
  $scope.showActionSheet = function(file) {

    var hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: '<i class="icon ion-ios-cloud-download-outline balanced"></i><b>Download</b>' }
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
  $scope.shouldShowDelete = false; // Variabele voor de deleteknoppen te laten zien
  //Functie voor het verwijderen van bestanden van de server
  $scope.remove = function(file) {
    var link = "http://filetransfer.alxb.be/upload/remove.php?username="+sessionService.get('username')+"&filename="+file.filename;
    console.log(link);
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

  // Controller gelinkt met de settingspagina
.controller('settingsCtrl', function($scope, sessionService, $ionicHistory, $state, $window) {
  $scope.signOut = function(){
    sessionService.destroy('username');
    $ionicHistory.currentView($ionicHistory.backView());
    $state.go('login',null, {location: 'replace'});
    $window.location.reload(true); // Full reset na uiloggen
  }
})

  // Controller gelinkt met de signup pagina
.controller('signupCtrl', function(signupService, $scope, $ionicPopup, $state) {
  $scope.data = {};
  // Wanneer er op register geklikt wordt
  $scope.register = function() {
    signupService.registerUser($scope.data.username, $scope.data.password).success(function(data) { // User registeren via signupService
      console.log(data); // signup gelukt
      var alertPopup = $ionicPopup.alert({
        title: 'Success!',
        template: 'You just registered!'
      });
      $state.go('login');
    }).error(function(data) { // singup mislukt
      var alertPopup = $ionicPopup.alert({
        title: 'Signup failed!',
        template: 'Error '+data
      });
    });
  }
})

  // Controller gelinkt met de gallerij
.controller('galleryCtrl', function($scope, $cordovaImagePicker, $ionicPlatform, $cordovaCamera, $ionicLoading, $ionicPopup, ShareService, GlobalVars, $cordovaFileTransfer, $ionicHistory, $state) {
  $scope.items = []; // Hier zitten foto's in die in de gallerij getoond worden
  $scope.sharePicture = function(option) { // Settings voor het halen van foto's van de camera ofwel photolibrary
    var options;
    switch(option) { // Foto van de camera
      case 'camera':
        options = {
          quality: 75,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.CAMERA,
          allowEdit: false,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 300,
          targetHeight: 300,
          popoverOptions: CameraPopoverOptions,
          saveToPhotoAlbum: true
        };
        break;
      case 'gallery': // Foto van het photoalbum
        options = {
          quality: 75,
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
          allowEdit: false,
          encodingType: Camera.EncodingType.JPEG,
          targetWidth: 300,
          targetHeight: 300,
          popoverOptions: CameraPopoverOptions
        };
        break;
    }
    $scope.data = {};

    // Vragen aan de gebruiker met wie het gedeelt moet worden
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

    askUser.then(function(res) { // Na het vragen aan de user voor een naam
      if(res != null) {
        $cordovaCamera.getPicture(options).then(function (imageData) {
          var targetPath = imageData;
          var filename = targetPath.split("/").pop();
          ShareService.shareFile(filename, $scope.data.user, true).success(function(data) {
            var url = GlobalVars.getServerUrl()+GlobalVars.getUploadPath()+"upload.php"; // Upload url samenstellen
            if(filename.split(".").pop() != "jpg") { // Uitzondering voor speciale foto's
              filename = filename.split('?')[0];
              console.log("Uploading with name: " + filename);
            }
            var options = { // Opties voor het uploaden van de foto
              fileKey: "file",
              fileName: filename,
              chunkedMode: false,
              mimeType: "image/jpg",
              params: {'directory': '../upload', 'fileName': filename}
            };
            $ionicLoading.show({
              template: 'Uploading'
            });
            $cordovaFileTransfer.upload(url, targetPath, options).then(function (result) { // Foto uploaden
              if(result.response == "UploadOK") { // Gelukt
                var alertPopup = $ionicPopup.alert({
                  title: 'Upload complete',
                  template: 'The picture has been uploaded and shared!'
                });
                console.log("SUCCESS: " + JSON.stringify(result.response));
              } else {
                var alertPopup = $ionicPopup.alert({ // Fout op de server
                  title: 'Upload failed',
                  template: 'Something went wrong :('
                });
              }

              $ionicLoading.hide();
            }, function (err) { // Fout met de verbinding
              console.log("ERROR: " + JSON.stringify(err));
              $ionicLoading.hide();
            }, function (progress) { // Progress voor het uploaden
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
  $scope.loadGallery = function() { // Foto's van een directory halen en in de gallerij steken
    $scope.items = [];
    getPictures(cordova.file.applicationStorageDirectory + "cache/pictures/");
    $scope.$broadcast('scroll.refreshComplete');
  };
  $ionicPlatform.ready(function() {
    $scope.loadGallery();
  });
  function getPictures(path){ // Het halen van de foto's in een directory
    window.resolveLocalFileSystemURL(path,
      function (fileSystem) {
        var reader = fileSystem.createReader();
        reader.readEntries(
          function (entries) {
            entries.forEach(function (file) {
              var url = file.toURL().replace("file://", ""); // Onnodige deel van de url trimmen
              $scope.items.push( // Foto in de lijst pushen
                {
                  src: url,
                  sub: file.name
                }
              );
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
