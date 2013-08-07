angular.module('exampleApp')

.controller('ExampleCtrl', [
         '$scope', '$location', '$templateCache',
function ($scope,   $location,   $templateCache) {

  $scope.linkList = [
    '/ng-select', '/select-class', '/select-style', '/select-disabled',
    '/select-multiple'
  ];

  // $scope.title = titleMap[key];

  $scope.source = null;
  $scope.toggleSource = function () {
    if ($scope.source === null) {
      $scope.source = $templateCache.get('partials' + $scope.path + '.html')[1];
    }
    else {
      $scope.source = null;
    }
  };

  $scope.$on('$routeChangeSuccess', function () {
    $scope.path = $location.path();
    $scope.disabled = false;
    $scope.source = null;
  });
}]);
