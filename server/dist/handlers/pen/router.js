'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressDevice = require('express-device');

var _expressDevice2 = _interopRequireDefault(_expressDevice);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Router = _express2.default.Router();

//  Middleware.
Router.use(_expressDevice2.default.capture());

// Note: Paths are added by the handler!

exports.default = Router;