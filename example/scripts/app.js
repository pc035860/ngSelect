angular.module('exampleApp', ['ngSelect', 'hljs'],
        ['$routeProvider',
function ($routeProvider) {

  angular.forEach([
    '/ng-select', '/select-class', '/select-style', '/select-disabled',
    '/select-multiple', '/with-ngModel-validation'
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

//Custom validator for "with-ngModel-validation" example.
angular.module('exampleApp').directive('exampleOdd', function(){
  return {
    require: 'ngModel',
    link: function(scope, el, attrs, ngModelCtrl) {
      ngModelCtrl.$parsers.push(function(viewValue) {
        if (parseInt(viewValue) % 2 == 0) {
          ngModelCtrl.$setValidity('exampleOdd', false);
          return undefined;
        } else {
          ngModelCtrl.$setValidity('exampleOdd', true);
          return viewValue;
        }
      });
      ngModelCtrl.$formatters.push(function(modelValue) {
        if (modelValue % 2 == 0) {
          ngModelCtrl.$setValidity('exampleOdd', false);
          return undefined;
        } else {
          ngModelCtrl.$setValidity('exampleOdd', true);
          return modelValue;
        }
      });
    }
  }
});
