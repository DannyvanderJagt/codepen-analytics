'use strict';

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _thesuitcaseUid = require('thesuitcase-uid');

var _thesuitcaseUid2 = _interopRequireDefault(_thesuitcaseUid);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _pen = require('../handlers/pen');

var _pen2 = _interopRequireDefault(_pen);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Server.

// import Favicon from 'serve-favicon'
var app = (0, _express2.default)();

// Middleware.

// Handlers
app.set('view engine', 'pug');
app.set('views', _path2.default.join(__dirname, '../../../content'));

app.use((0, _cookieParser2.default)(_config2.default.cookieSecret));

// Favicon
// app.use(Favicon(path.join(__dirname, '../../content/images/favicon.ico')))

// Basic Static files.
app.use(_express2.default.static(_path2.default.join(__dirname, '../../../content')));

/** 
 * Pen Routes
 */
app.use('/pen', _pen2.default.Router);

// Start the server.
var server = app.listen(_config2.default.port, function () {
  console.log('[Server] ' + _config2.default.port);
});