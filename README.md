# ngSelect
Transform any HTML element on the page to selectable components.

Watch simple demos on Plunker:
* [Demo with AngularJS 1.0.7](http://plnkr.co/edit/RNZepQ)
* [Demo with AngularJS 1.1.5](http://plnkr.co/edit/4neUeA)

## AngularJS version support
Both stable(1.0.7)/unstable(1.1.5) branch are supported.

## Getting started
Include the ngSelect module with AngularJS script in your page.
```html
<script src="//ajax.googleapis.com/ajax/libs/angularjs/1.1.5/angular.min.js"></script>
<script src="http://pc035860.github.io/ngSelect/ngSelect.min.js"></script>
```

Add `ngSelect` to your app module's dependency.
```js
angular.module('myApp', ['ngSelect']);
```

## Usage

### ng-select
Type: `scope varaible`
Default: `undefined`

Two-way binding target, the result might be `null` or `[]`(with `select-multiple`). The model will receive the value from `ng-select-option`.

[Live Example](http://pc035860.github.io/ngSelect/example/#/ng-select)
```html
<div class="row example" ng-select="selection">
  <div class="span12">
    <img class="img-polaroid img-circle" ng-select-option="{{ num }}" 
         select-class="{'selected': $optSelected}"
         ng-repeat="num in [1, 2, 3, 4, 5] track by $id($index)" 
         ng-src="http://lorempixel.com/100/100/sports/{{ num }}">
  </div>
</div>
```

### ng-select-option
Type: `string`
Default: `undefined`

Provides selection value for the model specified in `ng-select`.

#### select-class (optional)
Type: `expression`
Default: `undefined`

Provides the exact same functionality as <code>ng-class</code>, but with the additional local scope applied with `$optIndex`, `$optValue`, `$optSelected` varaibles to increase the usage flexibility. This optional directive is also applicable to `ng-select-option` as local configuration.

[Live Example](http://pc035860.github.io/ngSelect/example/#/select-class)
```html
<p class="lead">selection: {{ selection }}</p>
<div class="row example" ng-select="selection" select-class="{'selected': $optSelected}">
  <div class="span12">
    <img class="img-polaroid img-circle" ng-select-option="{{ num }}" 
         ng-repeat="num in [1, 2, 3, 4, 5] track by $id($index)" 
         ng-src="http://lorempixel.com/100/100/sports/{{ num }}">
  </div>
</div>
```

#### select-style (optional)
Type: `scope expr`
Default: `undefined`

Provides the exact same functionality as <code>ng-style</code>, but with the additional local scope applied with `$optIndex`, `$optValue`, `$optSelected` varaibles to increase the usage flexibility. This optional directive is also applicable to `ng-select-option` as local configuration.

[Live Example](http://pc035860.github.io/ngSelect/example/#/select-style)
```html
<p class="lead">selection: {{ selection }}</p>
<div class="row example" ng-select="selection" select-style="{'opacity': 0.2 * $optValue}">
  <div class="span12">
    <img class="img-polaroid img-circle" ng-select-option="{{ num }}" 
         select-class="{'selected': $optSelected}"
         ng-repeat="num in [1, 2, 3, 4, 5] track by $id($index)" 
         ng-src="http://lorempixel.com/100/100/sports/{{ num }}">
  </div>
</div>
```

#### select-disabled (optional)
Type: `scope expr`
Default: `undefined`

Disables the interactivity of options if the expression is evaluated to be `true`. The evaluation has the access to the additional local scope with `$optIndex`, `$optValue`, `$optSelected` varaibles to increase the usage flexibility. This optional directive is also applicable to `ng-select-option` as local configuration.

[Live Example](http://pc035860.github.io/ngSelect/example/#/select-disabled)
```html
<p class="lead">
  selection: {{ selection }}
  <button class="btn btn-danger btn-large" ng-show="!disabled" ng-click="disabled = true">disable</button>
  <button class="btn btn-success btn-large" ng-show="disabled" ng-click="disabled = false">enable</button>
</p>
<div class="row example" ng-select="selection" select-disabled="disabled || ($optIndex == 2 || $optIndex == 4)">
  <div class="span12">
    <img class="img-polaroid img-circle" ng-select-option="{{ num }}" 
         select-class="{'selected': $optSelected}"
         ng-repeat="num in [1, 2, 3, 4, 5] track by $id($index)" 
         ng-src="http://lorempixel.com/100/100/sports/{{ num }}">
  </div>
</div>
```

#### select-multiple (optional)
Type: `boolean`
Default: `false`

Enables `ng-select` to support multiple selection, of which the model binded will be an array.

[Live Example](http://pc035860.github.io/ngSelect/example/#/select-multiple)
```html
<p class="lead">selection: {{ selection }}</p>
<div class="row example multiple" ng-select="selection" select-class="{'selected': $optSelected}" select-multiple>
  <div class="span12">
    <img class="img-polaroid img-circle" ng-select-option="{{ num }}" 
         ng-repeat="num in [1, 2, 3, 4, 5] track by $id($index)" 
         ng-src="http://lorempixel.com/100/100/sports/{{ num }}">
  </div>
</div>
```



## Note

1. Duplicate values in `ng-select-option` will cause strange behavior.
