angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.service('BlankService', [function(){

}])

.service('GlobalVars', function() {
  var username = "test";
  return {
    getServerUrl: function() {
      return "http://filetransfer.alxb.be/";
    },
    getUploadPath: function() {
      return "upload/";
    }
  }
})

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

  .service('ShareService', function($q, $http, GlobalVars) {
    return {
      shareFile: function(filename, name) {
        var deferred = $q.defer();
        var promise = deferred.promise;

        var link = GlobalVars.getServerUrl() + "share.php?username="+name+"&filename="+filename;
        console.error(link);
        $http.get(link)
          .success(function(data) {
            deferred.resolve('Shared file');
          })
          .error(function(data) {
            deferred.reject('Failed to share file');
            alert("ERROR!");
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
          deferred.reject('Failed to share file');
          alert("ERROR!");
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
.service('signupService', function ($q, $http, GlobalVars) {
  return {
    registerUser: function(username, password) {
      var deferred = $q.defer();
      var promise = deferred.promise;
      var link = GlobalVars.getServerUrl() + "register.php?username="+username+"&password="+password;

      $http.get(link).success(function (data) {
        if(data.status == "ok") {
          console.log('success');
          deferred.resolve('Welcome ' + name + '!');
        } else {
          deferred.reject('Something went wrong');
        }
      }).error(function (data) {
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
    },
  };
});
