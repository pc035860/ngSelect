angular.module('exampleApp', ['ngSelect'], 
        ['$routeProvider', 
function ($routeProvider) {

  angular.forEach([
    '/ng-select', '/select-class', '/select-style', '/select-disabled',
    '/select-multiple'
  ], function (path) {
    $routeProvider.when(path, {
      templateUrl: 'partials' + path + '.html'
    });
  });

  $routeProvider
  .otherwise({
    redirectTo: '/ng-select'
  });
}]);
