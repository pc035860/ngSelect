angular.module('exampleApp')

.controller('ExampleCtrl', [
         '$scope', '$location',
function ($scope,   $location) {

  $scope.linkList = [
    '/ng-select'
  ];

  // $scope.title = titleMap[key];


  $scope.$on('$routeChangeSuccess', function () {
    $scope.path = $location.path();
  });
}]);
