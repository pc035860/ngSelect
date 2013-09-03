angular.module('ngSelect', [])

.controller('NgSelectCtrl', [
                     '$scope', '$parse', '$document',
function NgSelectCtrl($scope,   $parse,   $document) {
  var ctrl = this;

  var KEY_ID_CTRL = 'Control',
      KEY_ID_SHIFT = 'Shift',
      KEY_ID_ALT = 'Alt';

  var _optionIndex = 0,
      _config,
      _options = [],
      _modelGetter,
      _modiDown = {
        // ctrl & super
        ctrl: false,
        alt: false,
        shift: false
      },
      // leftover render
      _dirty = false;

  function _docKeydownHandler(evt) {
    if (evt.keyIdentifier === KEY_ID_CTRL) {
      _modiDown.ctrl = true;
    }
    else if (evt.keyIdentifier === KEY_ID_SHIFT) {
      _modiDown.shift = true;
    }
    else if (evt.keyIdentifier === KEY_ID_ALT) {
      _modiDown.alt = true;
    }
  }

  function _docKeyupHandler(evt) {
    if (evt.keyIdentifier === KEY_ID_CTRL) {
      _modiDown.ctrl = false;
    }
    else if (evt.keyIdentifier === KEY_ID_SHIFT) {
      _modiDown.shift = false;
    }
    else if (evt.keyIdentifier === KEY_ID_ALT) {
      _modiDown.alt = false;
    }
  }

  ctrl.init = function (config) {
    if (angular.isUndefined(config.model)) {
      throw new Error('ngSelect model is required');
    }

    config = angular.extend({
      multiple: false,
      ctrlModifier: false,
      shiftModifier: false,
      altModifier: false
    }, config);

    _config = angular.copy(config);
    _modelGetter = $parse(config.model);

    // initialize model
    var model = ctrl.getModel();
    if (angular.isUndefined(model)) {
      ctrl.setModel(_config.multiple ? [] : undefined);
    }

    if (_dirty) {
      // needs immediate render
      _dirty = false;
      ctrl.render();
    }

    if (ctrl.modifierEnabled()) {
      $document
        .bind('keydown', _docKeydownHandler)
        .bind('keyup', _docKeyupHandler);
    }
  };

  ctrl.modifierEnabled = function () {
    return (_config.ctrlModifier || _config.shiftModifier || _config.altModifier);
  };

  ctrl.getConfig = function () {
    return _config;
  };

  ctrl.addOption = function (value) {
    value = _isNumeric(value) ? Number(value) : value;

    var optionObj = {
      index: _optionIndex++,
      value: value,
      selected: (value == ctrl.getModel())
    };

    _options.push(optionObj);
    return optionObj;
  };

  ctrl.updateOption = function (optionObj, newValue) {
    optionObj.value = _isNumeric(newValue) ? Number(newValue) : newValue;

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

  ctrl.handleClick = function (optionObj) {
    if (!ctrl.modifierEnabled()) {
      ctrl[optionObj.selected ? 'unselect' : 'select'](optionObj);
      return;
    }
    
    if (_config.ctrlModifier) {
      /**
       * simulate windows selection(with ctrl) behavior
       */
      if (_modiDown.ctrl) {
        ctrl[optionObj.selected ? 'unselect' : 'select'](optionObj);
      }
      else {
        ctrl.select(optionObj);
      }
      return;
    }
  };

  ctrl.select = function (optionObj) {
    var unselectOthers = function () {
      angular.forEach(_options, function (option) {
        if (option.index !== optionObj.index) {
          option.selected = false;
        }
      });
    };

    optionObj.selected = true;

    if (!_config.multiple) {
      unselectOthers();
    }
    else {
      if (ctrl.modifierEnabled()) {
        if (_config.ctrlModifier && _modiDown.ctrl) {
          // do nothing
        }
        else {
          unselectOthers();
        }
      }
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
      ctrl.setModel(undefined);
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
      // delayed render for config init by setting dirty flag
      _dirty = true;
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
  };

  ctrl.recycle = function () {
    _options.length = 0;

    if (ctrl.modifierEnabled()) {
      $document
        .unbind('keydown', _docKeydownHandler)
        .unbind('keyup', _docKeyupHandler);
    }
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
      selection = undefined;
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
 * @param {expr}    select-class     general class control with vars ($optIndex, $optValue, $optSelected) (optional)
 * @param {boolean} select-multiple  enable multiple selection (optional)
 * @param {expr}    select-disabled  enable/disable selection with expression, available vars ($optIndex, $optValue, $optSelected) (optional)
 * @param {expr}    select-style     general style control with vars ($optIndex, $optValue, $optSelected) (optional)
 */
.directive('ngSelect', [function () {
  function _evalAsBoolean(scope, expr) {
    if (angular.isUndefined(expr)) {
      return false;
    }

    if (expr === '') {
      return true;
    }

    return Boolean(scope.$eval(expr));
  }

  // Runs during compile
  return {
    restrict: 'A',
    controller: 'NgSelectCtrl',
    link: {
      pre: function preLink(scope, iElm, iAttrs, ctrl) {
        var config = {}, buf;
        
        config.multiple = _evalAsBoolean(scope, iAttrs.selectMultiple);

        /**
         * modifiers are only available in multiple selection mode
         */
        if (iAttrs.selectModifiers && config.multiple) {
          if (iAttrs.selectModifiers === '*') {
            config.ctrlModifier = true;
            config.shiftModifier = true;
            config.altModifier = true;
          }
          else {
            buf = iAttrs.selectModifiers.split(/,/);
            if (buf) {
              angular.forEach(buf, function (modi) {
                switch (modi) {
                  case 'ctrl':
                    config.ctrlModifier = true;
                    break;
                  case 'shift':
                    config.shiftModifier = true;
                    break;
                  case 'alt':
                    config.altModifier = true;
                    break;
                }
              });
            }
          }
        }

        config.model = iAttrs.ngSelect;
        config.classExpr = iAttrs.selectClass;
        config.disabledExpr = iAttrs.selectDisabled;
        config.styleExpr = iAttrs.selectStyle;

        ctrl.init(config);

        // controller connection
        // iAttrs.$observe('ngSelectCtrl', function (val) {
        //   if (angular.isDefined(val)) {
        //     var assignFunc = $parse(val).assign;
        //     assignFunc(scope, ctrl);
        //   }
        // });

        scope.$watch(iAttrs.ngSelect, function (newVal, oldVal) {
          if (angular.isDefined(newVal) && newVal !== oldVal) {
            ctrl.render();
          }
        }, true);

        iElm.bind('$destroy', function () {
          ctrl.recycle();

          iElm.unbind('$destroy');
        });
      }
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
      iElm.bind('$destroy', function () {
        if (angular.isDefined(optionObj)) {
          ngSelectCtrl.removeOption(optionObj);
        }
        iElm.unbind('$destroy');
      });

      // ng-select-option ready
      iAttrs.$observe('ngSelectOption', function (newVal, oldVal) {
        if (angular.isDefined(newVal) && newVal !== oldVal) {
          if (angular.isUndefined(optionObj)) {
            // first time setup option
            optionObj = ngSelectCtrl.addOption(newVal);
      
            // bind click event
            iElm.bind('click', function () {
              if (!disabledExpr || !_isDisabled(disabledExpr, optionObj)) {
                scope.$apply(function () {
                  // triggering select/unselect modifies optionObj
                  // ngSelectCtrl[optionObj.selected ? 'unselect' : 'select'](optionObj);
                  ngSelectCtrl.handleClick(optionObj);
                });
              }
              return false;
            });

            // watch for select-class evaluation
            scope.$watch(function (scope) {
              return scope.$eval(classExpr, _getExprLocals(optionObj));
            }, _updateClass, true);

            // watch for select-style evaluation
            scope.$watch(function (scope) {
              return scope.$eval(styleExpr, _getExprLocals(optionObj));
            }, _updateStyle, true);
          }
          else {
            // update option value
            ngSelectCtrl.updateOption(optionObj, newVal);
          }
        }
      });

      function _initExprs (ctrlConfig) {
        classExpr = iAttrs.selectClass || ctrlConfig.classExpr;
        disabledExpr = iAttrs.selectDisabled || ctrlConfig.disabledExpr;
        styleExpr = iAttrs.selectStyle || ctrlConfig.styleExpr;
      }

      function _getExprLocals(optionObj) {
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

      function _isDisabled(disabledExpr, optionObj) {
        return scope.$eval(disabledExpr, _getExprLocals(optionObj));
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
