'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _pen = require('./routers/pen');

var _pen2 = _interopRequireDefault(_pen);

var _thesuitcaseUid = require('thesuitcase-uid');

var _thesuitcaseUid2 = _interopRequireDefault(_thesuitcaseUid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Routers

// import Favicon from 'serve-favicon'

var Secret = 'wc6x2pbp971rtfuuy6ybx2ds'; //Uid(4);
console.log('[Server] Cookie secret: ', Secret);

var app = (0, _express2.default)();

// Config.
app.set('view engine', 'pug');
app.set('views', _path2.default.join(__dirname, '../../../content'));

app.use((0, _cookieParser2.default)());

// Favicon
// app.use(Favicon(path.join(__dirname, '../../content/images/favicon.ico')))

// Pages
app.use(_express2.default.static(_path2.default.join(__dirname, '../../../content')));

/** 
 * Pens Routes
 * format: /pen/:id
 * extentions: .js/.json/.xml
 */
app.use('/pen', _pen2.default);

// Start the server.
var server = app.listen(_config2.default.port, function () {
  console.log('[Server] ' + _config2.default.port);
});