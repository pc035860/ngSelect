angular.module('exampleApp', ['ngSelect', 'hljs'], 
        ['$routeProvider', 
function ($routeProvider) {

  angular.forEach([
    '/ng-select', '/select-class', '/select-style', '/select-disabled',
    '/select-multiple', '/select-modifiers'
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
