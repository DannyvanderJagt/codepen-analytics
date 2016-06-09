'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _database = require('../../database');

var _database2 = _interopRequireDefault(_database);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

var _libs = require('../../libs');

var _libs2 = _interopRequireDefault(_libs);

var _thesuitcaseUid = require('thesuitcase-uid');

var _thesuitcaseUid2 = _interopRequireDefault(_thesuitcaseUid);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _uaParserJs = require('ua-parser-js');

var _uaParserJs2 = _interopRequireDefault(_uaParserJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var Handler = {
  Router: _router2.default,

  reject: function reject(res, type) {

    switch (type) {
      case 'json':
        res.json({ valid: false });
        break;
    }

    return;
  },
  routerDidRequestForJavascript: function routerDidRequestForJavascript(req, res, next) {
    var unique = (0, _thesuitcaseUid2.default)(4);

    var item = new _database2.default.models.Identifier({
      id: unique,
      pen: req.params.id
    });

    // No need for waiting.
    item.save();

    // Render the javascript lib.
    res.send(_libs2.default.getJavascriptForPen(unique));
  },
  routerDidRequestForJson: function routerDidRequestForJson(req, res, next) {
    var _this = this;

    if (!req.params.id) {
      this.reject(res, 'json');
      return;
    }

    _database2.default.models.Pen.findOneAndUpdate({ id: req.params.id }, {
      lastUsed: Date.now()
    }, { new: true, fields: { _id: false, __v: false } }, function (err, pen) {
      if (err || !pen) {
        _this.reject(res, 'json');
        return;
      }

      res.set('Content-Type', 'text/json');
      res.json(pen);
      return;
    });
  },
  routerDidRequestForPage: function routerDidRequestForPage(req, res, next) {
    if (!req.params.id) {
      this.reject(res, 'json');
      return;
    }

    _database2.default.models.Pen.findOneAndUpdate({ id: req.params.id }, {
      lastUsed: Date.now()
    }, { new: true, fields: { _id: false, __v: false } }, function (err, pen) {
      if (err || !pen) {
        res.render('notfound');
        return;
      }

      res.render('pen', pen);
      return;
    });
  },
  routerDidRequestForPost: function routerDidRequestForPost(req, res, next) {
    if (!req.params.id) {
      this.reject(res, 'json');
      return;
    }

    var cookies = req.cookies;
    var query = req.query;

    if (!query) {
      this.reject(res, 'json');
      return;
    }

    _async2.default.waterfall([_async2.default.apply(this.validateUniqueID, {
      req: req,
      res: res,
      next: next,
      params: req.params,
      query: query,
      cookies: cookies
    }), this.setCookie, this.collectResult, this.updateDatabase], function (err, result) {
      if (err) {
        result.res.json({ valid: false });
        return;
      }

      result.res.json({ valid: true });
    });
  },

  // Handle post requests.
  validateUniqueID: function validateUniqueID(data, next) {
    data.valid = false;

    _database2.default.models.Identifier.findOne({ id: data.params.id }, function (err, item) {
      if (!err && item && item.pen) {
        data.pen = item.pen;
        data.valid = true;
        next(null, data);
        return;
      }

      next(new Error('Not Allowed!'), data);
    });
  },
  setCookie: function setCookie(data, next) {
    var cookies = data.cookies;
    var pens = [];
    var expires = new Date(Date.now() + 360000);

    if (cookies['codepen-analytics']) {
      pens = JSON.parse(cookies['codepen-analytics']);
    }

    // Disabled: Cookies on safari not working due to iframe.
    if (pens.indexOf(data.pen) > -1) {
      // next(new Error('already visited!'), data)
      // return;
    }

    pens.push(data.pen);

    // Expires in one day.
    data.res.cookie('codepen-analytics', JSON.stringify(pens));

    next(null, data);
  },
  collectResult: function collectResult(data, next) {
    var result = {};

    // Parse the User Agent.
    result = new _uaParserJs2.default().setUA(data.req.get('user-agent')).getResult();

    // Abstract data from the query.
    result.display = {
      width: data.query['display_width'],
      height: data.query['display_height'],
      colorDepth: data.query['display_colordepth'],
      pixelDepth: data.query['display_pixeldepth']
    };

    result.window = {
      width: data.query['window_width'],
      height: data.query['window_height'],
      devicePixelRatio: data.query['window_devicepixelratio']
    };

    // Fallback for User Agent device type.
    if (!result.device.type) {
      result.device.type = data.req.device.type || undefined;
    }

    data.result = result;
    next(null, data);
  },
  updateDatabase: function updateDatabase(data, next) {
    var _inc;

    var result = data.result;

    // Prepare data.
    var inc = (_inc = {}, _defineProperty(_inc, 'browsers.total', 1), _defineProperty(_inc, 'browsers.' + result.browser.name.toLowerCase() + '.total', 1), _defineProperty(_inc, 'browsers.' + result.browser.name.toLowerCase() + '.major.' + result.browser.major, 1), _defineProperty(_inc, 'browsers.' + result.browser.name.toLowerCase() + '.minor.' + result.browser.version.replace(/\./g, '-'), 1), _defineProperty(_inc, 'devices.total', 1), _defineProperty(_inc, 'devices.' + result.device.type, 1), _defineProperty(_inc, 'displays.total', 1), _defineProperty(_inc, 'displays.sizes.' + result.display.width + 'x' + result.display.height, 1), _defineProperty(_inc, 'displays.colordepth.' + result.display.colorDepth, 1), _defineProperty(_inc, 'displays.pixeldepth.' + result.display.pixelDepth, 1), _defineProperty(_inc, 'windows.total', 1), _defineProperty(_inc, 'windows.sizes.' + result.window.width + 'x' + result.window.height, 1), _defineProperty(_inc, 'windows.devicePixelRatios.' + result.window.devicePixelRatio, 1), _defineProperty(_inc, 'engines.total', 1), _defineProperty(_inc, 'engines.' + result.engine.name.toLowerCase() + '.total', 1), _defineProperty(_inc, 'engines.' + result.engine.name.toLowerCase() + '.' + result.engine.version.replace(/\./g, '-'), 1), _defineProperty(_inc, 'os.total', 1), _defineProperty(_inc, 'os.' + result.os.name.toLowerCase() + '.total', 1), _defineProperty(_inc, 'os.' + result.os.name.toLowerCase() + '.' + result.os.version.replace(/\./g, '-'), 1), _inc);

    // Process data.
    _database2.default.models.Pen.findOneAndUpdate({ id: data.pen }, {
      '$inc': inc,
      'lastUsed': Date.now()
    }, { upsert: true, setDefaultsOnInsert: true, new: true }, function (err, pen) {
      if (err) {
        next(new Error('Data could not be saved!'));
        return;
      }

      next(null, data);
    });
  }
};

// Add paths.
_router2.default.get('/:id.js', Handler.routerDidRequestForJavascript.bind(Handler));
_router2.default.get('/:id.json', Handler.routerDidRequestForJson.bind(Handler));
_router2.default.get('/:id', Handler.routerDidRequestForPage.bind(Handler));
_router2.default.get('/post/:id', Handler.routerDidRequestForPost.bind(Handler));

exports.default = Handler;