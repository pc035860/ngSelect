angular.module('ngSelect', [])

.controller('ngSelectCtrl', ['$scope', '$parse',
function ngSelectCtrl($scope, $parse) {
  var ctrl = this;

  var _optionIndex = 0,
      _config,
      _options = [],
      _modelGetter;

  ctrl.EVENT_INIT = 'ngSelect:init';
  ctrl.EVENT_RENDER = 'ngSelect:render';

  ctrl.init = function (config) {
    if (angular.isUndefined(config.model)) {
      throw new Error('ngSelect model is required');
    }

    config = angular.extend({
      multiple: false
    }, config);

    _config = angular.copy(config);
    _modelGetter = $parse(config.model);

    // initialize model
    var model = ctrl.getModel();
    if (angular.isUndefined(model)) {
      ctrl.setModel(_config.multiple ? [] : null);
    }

    $scope.$broadcast(ctrl.EVENT_INIT, [_config.model]);
  };

  ctrl.getConfig = function () {
    return _config;
  };

  ctrl.addOption = function (value) {
    var optionObj = {
      index: _optionIndex++,
      value: _isNumeric(value) ? Number(value) : value,
      selected: false
    };

    _options.push(optionObj);
    return optionObj;
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
    if (!_config.multiple) {
      return;
    }

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
    var setter = _modelGetter.assign;
    setter($scope, val);
  };

  ctrl.getModel = function () {
    return _modelGetter($scope);
  };

  ctrl.render = function () {
    if (angular.isUndefined(_config)) {
      return;
    }

    if (_config.multiple) {
      var selection = angular.copy(ctrl.getModel()),
          // shallow copy for optionObj reference
          optionsCopy = angular.extend([], _options),
          l = selection.length,
          val, foundOption;
      // select matched options
      while (l--) {
        val = selection.shift();
        foundOption = optionsCopy.splice(_findOptionIndexByValue(optionsCopy, val), 1)[0];
        if (foundOption) {
          foundOption.selected = true;
        }
      }
      // unselect not matched options
      angular.forEach(optionsCopy, function (option) {
        option.selected = false;
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

    $scope.$broadcast(ctrl.EVENT_RENDER, [_config.model]);
  };

  function _findOptionIndexByValue(list, value) {
    var i, l = list.length;
    for (i = 0; i < l; i++) {
      if (list[i].value == value) {
        return i;
      }
    }
    return -1;
  }

  function _isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  function _updateModel () {
    var selection;

    if (_config.multiple) {
      var createArray = false;
      // update model with reference
      selection = ctrl.getModel();
      if (!angular.isArray(selection)) {
        createArray = true;
        selection = [];
      }
      else {
        selection.length = 0;
      }
      angular.forEach(_options, function (option) {
        if (option.selected) {
          selection.push(option.value);
        }
      });

      if (createArray) {
        ctrl.setModel(selection);
      }
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
      ctrl.setModel(selection);
    }
  }
}])

/**
 * @ngdoc directive
 * @description transform any dom elements to selectable object - container
 *
 * @param {expr}    ng-select        model
 * @param {expr}    select-class     general class control with vars ($index, $value, $selected) (optional)
 * @param {boolean} select-multiple  enable multiple selection (optional)
 * @param {expr}    select-disabled  enable/disable selection with expression, available vars ($index, $value, $selected) (optional)
 */
.directive('ngSelect', ['$parse', '$timeout', function ($parse, $timeout) {
  // Runs during compile
  return {
    restrict: 'A',
    controller: 'ngSelectCtrl',
    link: function(scope, iElm, iAttrs, ctrl) {
      var config = {};
      
      // judge multiple
      config.multiple = (function () {
        if (angular.isUndefined(iAttrs.selectMultiple)) {
          return false;
        }
        return (iAttrs.selectMultiple === '' || Number(iAttrs.selectMultiple) === 1);
      }());
      config.model = iAttrs.ngSelect;
      config.classExpr = iAttrs.selectClass;
      config.disabledExpr = iAttrs.selectDisabled;

      // delayed to wait for options ready
      $timeout(function () {
        ctrl.init(config);
      });

      // controller connection
      // iAttrs.$observe('ngSelectCtrl', function (val) {
      //   if (angular.isDefined(val)) {
      //     var assignFunc = $parse(val).assign;
      //     assignFunc(scope, ctrl);
      //   }
      // });

      scope.$watch(iAttrs.ngSelect, function (newVal, oldVal) {
        if (newVal && !angular.equals(newVal, oldVal)) {
          ctrl.render();
        }
      }, true);
    }
  };
}])

/**
 * @ngdoc directive
 * @description transform any dom elements to selectable object - child
 *
 * @param {expr} ng-select-option  select option value
 * @param {expr} select-class      option specific class control with vars ($index, $value, $selected) (optional)
 * @param {expr} select-disabled   option specific enable/disable selection with expression, available vars ($index, $value, $selected) (optional)
 */
.directive('ngSelectOption', [function () {
  // Runs during compile
  return {
    restrict: 'A',
    require: '^ngSelect',
    link: function(scope, iElm, iAttrs, ngSelectCtrl) {
      var optionObj, classWatchDeregister, oldVal, newVal,
          disabledExpr, classExpr;
      
      // ng-select-option ready
      iAttrs.$observe('ngSelectOption', function (val) {
        if (angular.isDefined(val)) {
          optionObj = ngSelectCtrl.addOption(iAttrs.ngSelectOption);
    
          iElm.bind('click', function () {
            if (!disabledExpr || !_isDisabled(disabledExpr, optionObj)) {
              scope.$apply(function () {
                // triggering select/unselect modifies optionObj
                ngSelectCtrl[optionObj.selected ? 'unselect' : 'select'](optionObj);
              });
            }
          });
        }
      });
      
      // listen for config ready
      scope.$on(ngSelectCtrl.EVENT_INIT, function (evt, args) {
        var ctrlConfig = ngSelectCtrl.getConfig();
        // only react on same target model
        if (angular.isDefined(ctrlConfig) && ctrlConfig.model === args[0]) {
          _initExprs(ctrlConfig);
        }
      });

      // listen for class update
      scope.$on(ngSelectCtrl.EVENT_RENDER, function (evt, args) {
        var ctrlConfig = ngSelectCtrl.getConfig();
        // only react on same target model
        if (angular.isDefined(ctrlConfig) && ctrlConfig.model === args[0]) {
          // register for scope.$watch on class expression once
          if (!classWatchDeregister && classExpr) {
                var watchEval = function (scope) {
                  return scope.$eval(classExpr, _getExprLocals(optionObj));
                };
            classWatchDeregister = scope.$watch(watchEval, _updateClass, true);
          }
        }
      });

      function _initExprs (ctrlConfig) {
        classExpr = iAttrs.selectClass || ctrlConfig.classExpr;
        disabledExpr = iAttrs.disabledExpr || ctrlConfig.disabledExpr;
      }

      function _getExprLocals(optionObj) {
        var locals = {};
        angular.forEach(optionObj, function (value, key) {
          locals['$' + key] = value;
        });
        return locals;
      }

      function _isDisabled(disabledExpr, optionObj) {
        return scope.$eval(disabledExpr, _getExprLocals(optionObj));
      }

      function _updateClass(val) {
        newVal = val;
        if (oldVal && !angular.equals(newVal, oldVal)) {
          _removeClass(oldVal);
        }
        _addClass(newVal);
        oldVal = angular.copy(newVal);
      }

      function _removeClass(classVal) {
        if (angular.isObject(classVal) && !angular.isArray(classVal)) {
          classVal = _map(classVal, function(v, k) { if (v) { return k; } });
        }
        iElm.removeClass(angular.isArray(classVal) ? classVal.join(' ') : classVal);
      }

      function _addClass(classVal) {
        if (angular.isObject(classVal) && !angular.isArray(classVal)) {
          classVal = _map(classVal, function(v, k) { if (v) { return k; } });
        }
        if (classVal) {
          iElm.addClass(angular.isArray(classVal) ? classVal.join(' ') : classVal);
        }
      }

      function _map(obj, judgeFn) {
        var list = [];
        angular.forEach(obj, function (v, k) {
          var res = judgeFn(v, k);
          if (res) {
            list.push(res);
          }
        });
        return list;
      }
    }
  };
}]);
