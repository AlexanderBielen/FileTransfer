angular.module('app.services', [])

//Globale variabele
.service('GlobalVars', function() {
  var images = [];
  return {
    getServerUrl: function() {
      return "http://filetransfer.alxb.be/";
    },
    getUploadPath: function() {
      return "upload/";
    }
  }
})

  //Service die login controleert op de server
.service('LoginService', function($q, $http, GlobalVars, sessionService) {
  return {
    loginUser: function(name, pw) {
      var deferred = $q.defer();
      var promise = deferred.promise;

      var link = GlobalVars.getServerUrl() + "auth.php?username="+name+"&password="+pw;

      $http.get(link)
        .success(function(data) {
          if(data.status == "ok") {
            console.log('success');
            sessionService.set('username', name);
            deferred.resolve('Welcome ' + name + '!');
          } else {
            deferred.reject('Wrong credentials.');
          }
        })
        .error(function(data) {
          deferred.reject('Connection error.');
        });
      promise.success = function(fn) {
        promise.then(fn);
        return promise;
      };
      promise.error = function(fn) {
        promise.then(null, fn);
        return promise;
      };
      return promise;
    }
  }
})

  //Functie die een bestand deelt op de server met een andere user (niet uploaden)
  .service('ShareService', function($q, $http, GlobalVars) {
    return {
      shareFile: function(filename, name, picture) {
        var deferred = $q.defer();
        var promise = deferred.promise;
        if(picture) {
          filename = filename.split('?')[0];
        }
        var link = GlobalVars.getServerUrl() + "share.php?username="+name+"&filename="+filename;
        console.error(link);
        $http.get(link)
          .success(function(data) {
            deferred.resolve('Shared file');
          })
          .error(function(data) {
            deferred.reject('Failed to share file');
            console.log(JSON.stringify(data));
          });
        promise.success = function(fn) {
          promise.then(fn);
          return promise;
        };
        promise.error = function(fn) {
          promise.then(null, fn);
          return promise;
        };
        return promise;
      }
    }
  })

  //Functie die alle gedeelde bestanden van de server haalt voor een bepaalde user
.service('SharedService', function($q, $http, GlobalVars) {
  return {
    getSharedFiles: function(name) {
      var deferred = $q.defer();
      var promise = deferred.promise;

      var link = GlobalVars.getServerUrl() + "shared.php?username="+name;
      $http.get(link)
        .success(function(data) {
          deferred.resolve(data);
        })
        .error(function(data) {
          deferred.reject(data);
        });
      promise.success = function(fn) {
        promise.then(fn);
        return promise;
      };
      promise.error = function(fn) {
        promise.then(null, fn);
        return promise;
      };
      return promise;
    }
  }
})
  //Service voor het aanmaken van nieuwe gebruikers
.service('signupService', function ($q, $http, GlobalVars) {
  return {
    registerUser: function(username, password) {
      var deferred = $q.defer();
      var promise = deferred.promise;
      var link = GlobalVars.getServerUrl() + "register.php?username="+username+"&password="+password;

      if(username && password) {
        $http.get(link).success(function (data) {
          if(data.status == "ok") {
            console.log('success');
            deferred.resolve('Signup ok');
          } else {
            deferred.reject('Signup failed');
          }
        }).error(function (data) {
          deferred.reject('Connection error.');
        });
      } else {
        deferred.reject('Invalid username or password');
      }

      promise.success = function(fn) {
        promise.then(fn);
        return promise;
      };
      promise.error = function(fn) {
        promise.then(null, fn);
        return promise;
      };
      return promise;
    }
    }
})

  //Hier worden alle sessievariabele opgeslaan (gaan niet verloren bij het sluiten van de app)
.factory('sessionService',function(){
  return {
    set:function(key,value){
      return localStorage.setItem(key,JSON.stringify(value));
    },
    get:function(key){
      return JSON.parse(localStorage.getItem(key));
    },
    destroy:function(key){
      return localStorage.removeItem(key);
    }
  };
});
