angular.module('app.services', [])

.factory('BlankFactory', [function(){

}])

.service('BlankService', [function(){

}])

.service('GlobalVars', function() {
  var username = "test";
  return {
    setUsername: function(user) {
    username = user;
    },
    getUsername: function() {
      return username;
    },
    getServerUrl: function() {
      return "http://192.168.1.32:8080/";
    },
    getUploadPath: function() {
      return "upload/";
    }
  }
})

.service('LoginService', function($q, $http, GlobalVars) {
  return {
    loginUser: function(name, pw) {
      var deferred = $q.defer();
      var promise = deferred.promise;

      var link = GlobalVars.getServerUrl() + "auth.php?username="+name+"&password="+pw;

      $http.get(link)
        .success(function(data) {
          if(data.status == "ok") {
            console.log('success');
            GlobalVars.setUsername(name);
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
      shareFile: function(file, name) {
        var deferred = $q.defer();
        var promise = deferred.promise;

        var link = GlobalVars.getServerUrl() + "share.php?username="+name+"&filename="+file.name;
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
});
