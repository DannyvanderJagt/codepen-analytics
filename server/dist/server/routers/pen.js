'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _expressDevice = require('express-device');

var _expressDevice2 = _interopRequireDefault(_expressDevice);

var _libs = require('../../libs');

var _libs2 = _interopRequireDefault(_libs);

var _uaParserJs = require('ua-parser-js');

var _uaParserJs2 = _interopRequireDefault(_uaParserJs);

var _keys = require('../../keys');

var _keys2 = _interopRequireDefault(_keys);

var _database = require('../../database');

var _database2 = _interopRequireDefault(_database);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /** 
                                                                                                                                                                                                                   * Pens Routes
                                                                                                                                                                                                                   * format: /pen/:id
                                                                                                                                                                                                                   * extentions: .js/.json/.xml
                                                                                                                                                                                                                   */

// Router
var route = _express2.default.Router();

// Middleware
route.use(_expressDevice2.default.capture());

// Routes
route.get('/:id.js', function (req, res, next) {

  var unique = _keys2.default.generateUniqueKey();

  var item = new _database2.default.models.Identifier({
    id: unique,
    pen: req.params.id
  }).save();

  res.send(_libs2.default.getJavascriptForPen(unique));
});

route.get('/:id.json', function (req, res, next) {
  _database2.default.models.Pen.findOne({ id: req.params.id }, function (err, pen) {
    res.set('Content-Type', 'text/json');
    res.json(pen);
    return;
  });
});

route.get('/post', function (req, res, next) {
  // Only allow request from codepen.io with matching id's!
  var query = req.query;

  // let cookie = req.cookies.pens;

  // if(cookie){
  //   console.log(cookie, query.uni);
  // }else{
  //   res.cookie('pens', `[${req.params.id}]`)
  // }

  // res.cookie('pens', '[]');

  // Abstract User Agent.
  var result = new _uaParserJs2.default().setUA(req.get('user-agent')).getResult();

  // Combine data.
  result.uniqueid = query.uniqueid;

  result.display = {
    width: query['display_width'],
    height: query['display_height'],
    colorDepth: query['display_colordepth'],
    pixelDepth: query['display_pixeldepth']
  };

  result.window = {
    width: query['window_width'],
    height: query['window_height'],
    devicePixelRatio: query['window_devicepixelratio']
  };

  if (!result.device.type) {
    result.device.type = req.device.type || undefined;
  }

  // Set cookie
  res.cookie('visited', 'hi');

  // Check the unique id.
  _database2.default.models.Identifier.findOne({ id: result.uniqueid }, function (err, item) {
    if (err) {
      res.json('[{"valid": false}]');
      return;
    }

    // Process data.
    _database2.default.models.Pen.findOne({ id: item.pen }, function (err, pen) {
      var _$inc;

      if (pen === null) {
        new _database2.default.models.Pen({
          id: item.pen
        }).save();
        return;
      }

      // Store data.
      pen.update({
        $inc: (_$inc = {}, _defineProperty(_$inc, 'browsers.total', 1), _defineProperty(_$inc, 'browsers.' + result.browser.name.toLowerCase() + '.total', 1), _defineProperty(_$inc, 'browsers.' + result.browser.name.toLowerCase() + '.major.' + result.browser.major, 1), _defineProperty(_$inc, 'browsers.' + result.browser.name.toLowerCase() + '.minor.' + result.browser.version.replace(/\./g, '-'), 1), _defineProperty(_$inc, 'devices.total', 1), _defineProperty(_$inc, 'devices.' + result.device.type, 1), _defineProperty(_$inc, 'displays.total', 1), _defineProperty(_$inc, 'displays.sizes.' + result.display.width + 'x' + result.display.height, 1), _defineProperty(_$inc, 'displays.colordepth.' + result.display.colorDepth, 1), _defineProperty(_$inc, 'displays.pixeldepth.' + result.display.pixelDepth, 1), _defineProperty(_$inc, 'windows.total', 1), _defineProperty(_$inc, 'windows.sizes.' + result.window.width + 'x' + result.window.height, 1), _defineProperty(_$inc, 'windows.devicePixelRatios.' + result.window.devicePixelRatio, 1), _$inc)
      }, function (err, data) {
        // console.log('update', err, data)
      });
    });
  });

  res.json('[{"valid": true}]');
});

route.get('/:id', function (req, res, next) {
  _database2.default.models.Pen.findOne({ id: req.params.id }, function (err, pen) {
    res.render('pen', pen);
    return;
  });
});

exports.default = route;