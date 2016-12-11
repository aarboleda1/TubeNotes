angular.module('tubenotes', [
  'tubenotes.search',
  'tubenotes.watch',
  'tubenotes.auth', // this is where the error is however, in client/app/auth/auth.js a tubenotes.auth module exists
  'ngRoute'
])

//Error: [$injector:modulerr] Failed to instantiate module tubenotes.auth due to:
//Error: [$injector:nomod] Module 'tubenotes.auth' is not available! You either misspelled 
//the module name or forgot to load it. If registering a module ensure that you specify the dependencies 
//as the second argument.

.factory('AppFactory', function($http) {
  var addNote = function(note) {
    // note needs to be:
    // note = {
    //   username: '',
    //   videoUrl: '',
    //   videoTitle: '',
    //   commentTitle: '',
    //   commentText: ''
    // };

    $http.post('/comment-video', note);
  };
  
  var globalObj = {
    videoLibrary: [],
    currentVideo: {},
    currentLibraryVideo: {},
    addNote: addNote
  };

  return globalObj;
})

.controller('appController', function($scope) {
  $scope.currentVideo = "https://www.youtube.com/embed/4ZAEBxGipoA";
})

.config(function($routeProvider, $httpProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'app/auth/login.html',
      controller: ''
    })
    .when('/watch', {
      templateUrl: 'app/watch/watch.html',
      controller: 'WatchController'
    })
    .when('/search', {
      templateUrl: 'app/search/search.html',
      controller: 'SearchController'
    })   
    .when('/signup', {
      templateUrl: 'app/auth/signup.html',
      controller: 'AuthController'
    })    
    .when('/login', {
      templateUrl: 'app/auth/login.html',
      controller: 'AuthController'
    })
    .otherwise({
      redirectTo: '/search'
    })
  // We add our $httpInterceptor into the array
  // of interceptors. Think of it like middleware for your ajax calls
  $httpProvider.interceptors.push('AttachTokens');

})

.factory('AttachTokens', function ($window) {
  // this is an $httpInterceptor
  // its job is to stop all out going request
  // then look in local storage and find the user's token
  // then add it to the header so the server can validate the request
  var attach = {
    request: function (object) {
      var jwt = $window.localStorage.getItem('com.shortly');
      if (jwt) {
        object.headers['x-access-token'] = jwt;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
  return attach;
})
.run(function ($rootScope, $location, Auth) {
  // here inside the run phase of angular, our services and controllers
  // have just been registered and our app is ready
  // however, we want to make sure the user is authorized
  // we listen for when angular is trying to change routes
  // when it does change routes, we then look for the token in localstorage
  // and send that token to the server to see if it is a real user or hasn't expired
  // if it's not valid, we then redirect back to signin/signup
  $rootScope.$on('$routeChangeStart', function (evt, next, current) {
    if (next.$$route && next.$$route.authenticate && !Auth.isAuth()) {
      $location.path('/signin');
    }
  });
});