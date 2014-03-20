angular.module('ngSelect', [])

.controller('NgSelectCtrl', [
                     '$scope',
function NgSelectCtrl($scope) {
  var ctrl = this;

  var _optionIndex = 0,
      _config,
      _options = [],
      _ngModel,
      // leftover render
      _dirty = false;

  ctrl.init = function (ngModel, config) {
    config = angular.extend({
      multiple: false
    }, config);

    _config = config;
    _ngModel = ngModel;
    _ngModel.$render = ctrl.render;

    if (_dirty) {
      // needs immediate render
      _dirty = false;
      ctrl.render();
    }
  };

  ctrl.getConfig = function () {
    return _config;
  };

  ctrl.addOption = function (value) {
    var optionObj = {
      index: _optionIndex++,
      value: value,
      selected: false
    };

    if (_config.multiple) {
      var model = ctrl.getModel();
      if (angular.isArray(model)) {
        optionObj.selected = (ctrl.getModel().indexOf(value) >= 0);
      }
    }
    else {
      optionObj.selected = (value == ctrl.getModel());
    }

    _options.push(optionObj);
    return optionObj;
  };

  ctrl.updateOption = function (optionObj, newValue) {
    optionObj.value = newValue;

    _updateModel();
  };

  ctrl.removeOption = function (optionObj) {
    if (optionObj.selected) {
      ctrl.unselect(optionObj);
    }

    var i, l, option;
    for (i = 0, l = _options.length; i < l; i++) {
      option = _options[i];
      if (angular.equals(optionObj, option)) {
        _options.splice(i, 1);
        break;
      }
    }
  };

  ctrl.select = function (optionObj) {
    optionObj.selected = true;

    if (!_config.multiple) {
      angular.forEach(_options, function (option) {
        if (option.index !== optionObj.index) {
          option.selected = false;
        }
      });
    }

    _updateModel();
  };

  ctrl.unselect = function (optionObj) {
    optionObj.selected = false;

    _updateModel();
  };

  ctrl.clear = function () {
    if (_config.multiple) {
      var model = ctrl.getModel();
      if (!angular.isArray(model)) {
        ctrl.setModel([]);
      }
      else {
        model.length = 0;
      }
    }
    else {
      ctrl.setModel(null);
    }
  };

  ctrl.setModel = function (val) {
    _ngModel.$setViewValue(val);
  };

  ctrl.getModel = function () {
    return _ngModel.$modelValue;
  };

  ctrl.render = function () {
    if (angular.isUndefined(_config)) {
      // delayed render for config init by setting dirty flag
      _dirty = true;
      return;
    }

    if (_config.multiple) {
      var selection = ctrl.getModel();
      angular.forEach(_options, function(optionsObj) {
        var option_selected = false;
        for (var i = 0; i < selection.length; i++) {
          if (selection[i] === optionsObj.value) {
            option_selected = true;
            break;
          }
        }
        optionsObj.selected = option_selected;
      });
    }
    else {
      var found = false;
      angular.forEach(_options, function (option) {
        // select first found option (if there's duplicate value)
        if (!found && option.value == ctrl.getModel()) {
          option.selected = true;
          found = true;
        }
        else {
          option.selected = false;
        }
      });
    }
  };

  function _updateModel () {
    var selection;

    if (_config.multiple) {
      // update model with reference
      selection = ctrl.getModel();
      if (!angular.isArray(selection)) {
        selection = [];
      } else {
        selection.length = 0;
      }
      angular.forEach(_options, function (option) {
        if (option.selected) {
          selection.push(option.value);
        }
      });
    }
    else {
      selection = null;
      // update model with scalar value
      var i, l, option;
      for (i = 0, l = _options.length; i < l; i++) {
        option = _options[i];
        if (option.selected) {
          selection = option.value;
          break;
        }
      }
    }

    ctrl.setModel(selection);
  }
}])

/**
 * @ngdoc directive
 * @description transform any dom elements to selectable object - container
 *
 * @param {boolean} ng-select        enable/disable selection logic for appropriate ngModel.
 * @param {expr}    select-class     general class control with vars ($optIndex, $optValue, $optSelected) (optional)
 * @param {boolean} select-multiple  enable multiple selection (optional)
 * @param {expr}    select-disabled  enable/disable selection with expression, available vars ($optIndex, $optValue, $optSelected) (optional)
 * @param {expr}    select-style     general style control with vars ($optIndex, $optValue, $optSelected) (optional)
 */
.directive('ngSelect', [function () {
  return {
    restrict: 'A',
    controller: 'NgSelectCtrl',
    require: 'ngModel',
    link: function (scope, iElm, iAttrs, ngModelCtrl) {
      var ctrl = iElm.data('$ngSelectController');
      var config = {};

      // judge multiple
      config.multiple = (function () {
        if (angular.isUndefined(iAttrs.selectMultiple)) {
          return false;
        }
        return (iAttrs.selectMultiple === '' || Number(iAttrs.selectMultiple) === 1);
      }());
      config.classExpr = iAttrs.selectClass;
      config.disabledExpr = iAttrs.selectDisabled;
      config.styleExpr = iAttrs.selectStyle;

      ctrl.init(ngModelCtrl, config);
    }
  };
}])

/**
 * @ngdoc directive
 * @description transform any dom elements to selectable object - child
 *
 * @param {expr} ng-select-option  select option value
 * @param {expr} select-class      option specific class control with vars ($optIndex, $optValue, $optSelected) (optional)
 * @param {expr} select-disabled   option specific enable/disable selection with expression, available vars ($optIndex, $optValue, $optSelected) (optional)
 * @param {expr} select-style      option specific style control with vars ($optIndex, $optValue, $optSelected) (optional)
 */
.directive('ngSelectOption', [function () {
  // Runs during compile
  return {
    restrict: 'A',
    require: '^ngSelect',
    link: function(scope, iElm, iAttrs, ngSelectCtrl) {
      var optionObj, disabledExpr, classExpr, styleExpr;

      // init expressions
      _initExprs(ngSelectCtrl.getConfig());

      // listen for directive destroy
      scope.$on('$destroy', function () {
        if (angular.isDefined(optionObj)) {
          ngSelectCtrl.removeOption(optionObj);
        }
      });

      // ng-select-option ready
      iAttrs.$observe('ngSelectOption', function (newVal, oldVal) {
        if (angular.isDefined(newVal) && newVal !== oldVal) {
          if (angular.isUndefined(optionObj)) {
            // first time setup option
            optionObj = ngSelectCtrl.addOption(scope.$eval(newVal));

            // bind click event
            iElm.bind('click', function () {
              if (!_isDisabled(optionObj)) {
                scope.$apply(function () {
                  // triggering select/unselect modifies optionObj
                  ngSelectCtrl[optionObj.selected ? 'unselect' : 'select'](optionObj);
                });
              }
              return false;
            });

            // watch for select-class evaluation
            scope.$watch(function (scope) {
              return scope.$eval(classExpr, _getStyleExprLocals(optionObj));
            }, _updateClass, true);

            // watch for select-style evaluation
            scope.$watch(function (scope) {
              return scope.$eval(styleExpr, _getStyleExprLocals(optionObj));
            }, _updateStyle, true);
          }
          else {
            // update option value
            ngSelectCtrl.updateOption(optionObj, newVal);
          }
        }
      });

      function _initExprs(ctrlConfig) {
        classExpr = iAttrs.selectClass || ctrlConfig.classExpr;
        disabledExpr = iAttrs.selectDisabled || ctrlConfig.disabledExpr;
        styleExpr = iAttrs.selectStyle || ctrlConfig.styleExpr;
      }

      function _getBaseExprLocals(optionObj) {
        var locals = {},
            capitalize = function (str) {
              str = str.toLowerCase();
              return str.charAt(0).toUpperCase() + str.slice(1);
            };
        angular.forEach(optionObj, function (value, key) {
          locals['$opt' + capitalize(key)] = value;
        });
        return locals;
      }

      function _getStyleExprLocals(optionObj) {
        var locals = _getBaseExprLocals(optionObj);
        locals.$optDisabled = _isDisabled(optionObj);
        return locals;
      }

      function _isDisabled(optionObj) {
        return disabledExpr && scope.$eval(disabledExpr, _getBaseExprLocals(optionObj));
      }

      function _updateStyle(newStyles, oldStyles) {
        if (oldStyles && (newStyles !== oldStyles)) {
          angular.forEach(oldStyles, function(val, propertyName) {
            iElm.css(propertyName, '');
          });
        }
        if (newStyles) {
          iElm.css(newStyles);
        }
      }

      function _updateClass(newClass, oldClass) {
        var map = function (obj, judgeFn) {
              var list = [];
              angular.forEach(obj, function (v, k) {
                var res = judgeFn(v, k);
                if (res) {
                  list.push(res);
                }
              });
              return list;
            },
            removeClass = function (classVal) {
              if (angular.isObject(classVal) && !angular.isArray(classVal)) {
                classVal = map(classVal, function(v, k) { if (v) { return k; } });
              }
              iElm.removeClass(angular.isArray(classVal) ? classVal.join(' ') : classVal);
            },
            addClass = function (classVal) {
              if (angular.isObject(classVal) && !angular.isArray(classVal)) {
                classVal = map(classVal, function(v, k) { if (v) { return k; } });
              }
              if (classVal) {
                iElm.addClass(angular.isArray(classVal) ? classVal.join(' ') : classVal);
              }
            };

        if (oldClass && !angular.equals(newClass, oldClass)) {
          removeClass(oldClass);
        }
        addClass(newClass);
      }
    }
  };
}]);
