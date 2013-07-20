angular.module('exampleApp', ['ngSelect'], 
        ['$routeProvider', 
function ($routeProvider) {

  $routeProvider
    .when('/ng-select', {
      templateUrl: 'partials/ng-select.html'
      // controller: 'ExampleCtrl',
      // resolve: {
      //   key: function () { return 'ng-select'; }
      // }
    })
    .otherwise({
      redirectTo: '/ng-select'
    });
}]);
