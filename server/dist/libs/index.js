'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Lib = {
  cache: {},

  load: function load() {
    for (var lib in _config2.default.libs) {
      this.cache[lib] = _fs2.default.readFileSync(_config2.default.libs[lib]);
    }
  },
  getJavascriptForPen: function getJavascriptForPen(uniqueid) {
    return '\n      !(function(){ \n        var uniqueid = \'' + uniqueid + '\';\n        ' + this.cache.pen + '\n      }());\n    ';
  }
};

Lib.load();

exports.default = Lib;