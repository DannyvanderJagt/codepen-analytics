'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Validater = {
  codepen: function codepen(req) {
    var referer = req.headers.referer;

    if (!referer) {
      return false;
    }

    var parts = referer.split('http://s.codepen.io');

    console.log('{validate}', referer, parts);
    return true;
  }
};

exports.default = Validater;