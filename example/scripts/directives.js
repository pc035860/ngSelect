angular.module('exampleApp')

.directive('codeHighlight', [
         '$timeout',
function ($timeout) {
  return {
    restrict: 'EA',
    compile: function(tElm, tAttrs, transclude) {
      // get static code
      // strip the starting "new line" character
      var staticCode = tElm[0].innerHTML.replace(/^\r\n|\r|\n/, '');

      // put template
      tElm.html('<pre><code></pre></code>');

      return function postLink(scope, iElm, iAttrs) {
        var codeElm = iElm.find('code');

        if (staticCode) {
          _highlightCode(codeElm, staticCode);
        }

        scope.$watch(iAttrs.code, function (newCode, oldCode) {
          if (angular.isDefined(newCode) && newCode !== oldCode) {
            _highlightCode(codeElm, newCode);
          }
        });

        function _highlightCode(codeElm, code) {
          codeElm.text(code);

          $timeout(function () {
            hljs.highlightBlock(codeElm[0]);
          });
        }
      };
    }
  };
}]);
