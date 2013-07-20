angular.module('exampleApp')

.controller('ExampleCtrl', [
         '$scope', '$location',
function ($scope,   $location) {

  $scope.linkList = [
    '/ng-select', '/select-class', '/select-style', '/select-disabled',
    '/select-multiple'
  ];

  // $scope.title = titleMap[key];


  $scope.$on('$routeChangeSuccess', function () {
    $scope.path = $location.path();
  });
}]);
