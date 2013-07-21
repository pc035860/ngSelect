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
Type: `model getter`
Default: `undefined`
[Example](http://pc035860.github.io/ngSelect/example/#/ng-select)

##### select-class
Type: `scope expr`
Default: `undefined`
[Example](http://pc035860.github.io/ngSelect/example/#/select-class)

##### select-style
Type: `scope expr`
Default: `undefined`
[Example](http://pc035860.github.io/ngSelect/example/#/select-style)

##### select-disabled
Type: `scope expr`
Default: `undefined`
[Example](http://pc035860.github.io/ngSelect/example/#/select-disabled)

##### select-multiple
Type: `boolean`
Default: `false`
[Example](http://pc035860.github.io/ngSelect/example/#/select-multiple)

### ng-select-option
Type: `string`
Default: `undefined`

## Limitations
