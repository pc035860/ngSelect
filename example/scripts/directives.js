angular.module('exampleApp')

.directive('codeHighlight', [
         '$timeout',
function ($timeout) {
  return {
    restrict: 'EA',
    template: '<pre><code></code></pre>',
    link: function(scope, iElm, iAttrs) {
      scope.$watch(iAttrs.code, function (newCode, oldCode) {
        if (angular.isDefined(newCode) && newCode !== oldCode) {
          var codeElm = iElm.find('code');
          codeElm.text(newCode);

          $timeout(function () {
            hljs.highlightBlock(codeElm[0]);
          });
        }
      });
    }
  };
}]);
