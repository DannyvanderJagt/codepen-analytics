'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  port: 8003,
  cookieSecret: 'wc6x2pbp971rtfuuy6ybx2ds',

  libs: {
    pen: _path2.default.join(__dirname, '../../libs/pen.js')
  }
};