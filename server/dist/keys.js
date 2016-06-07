'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _thesuitcaseUid = require('thesuitcase-uid');

var _thesuitcaseUid2 = _interopRequireDefault(_thesuitcaseUid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Keys = {
  generateUniqueKey: function generateUniqueKey() {
    return (0, _thesuitcaseUid2.default)(4);
  }
};

exports.default = Keys;