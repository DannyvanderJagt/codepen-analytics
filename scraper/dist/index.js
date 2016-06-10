'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _database = require('../../server/dist/database');

var _database2 = _interopRequireDefault(_database);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _toughCookieFilestore = require('tough-cookie-filestore');

var _toughCookieFilestore2 = _interopRequireDefault(_toughCookieFilestore);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// Path for cookies files.
var cookiesPath = _path2.default.join(__dirname, '../', 'cookies.json');

// Ensure cookie file.
_fsExtra2.default.ensureFileSync(cookiesPath);

var Scraper = {
  jar: _request2.default.jar(new _toughCookieFilestore2.default(cookiesPath)),

  queue: [],
  busy: false,
  continue: false,
  start: function start() {
    var _this = this;

    if (this.busy) {
      return;
    }
    this.queue = [];
    this.continue = true;
    this.busy = true;

    this.collectPensForProcessing(function () {
      _this.next();
    });
  },
  next: function next() {
    var _this2 = this;

    if (this.queue.length === 0) {
      this.stop();
      return;
    }
    if (this.continue === false) {
      this.stop();
      return;
    }

    this.busy = true;
    this.continue = true;

    var pen = this.queue.splice(0, 1);

    this.getInformationFromPen(pen, function (err, data) {
      console.log(Scraper.queue);
      _this2.next();
    });
  },
  stop: function stop() {
    if (!this.busy) {
      return;
    }
    this.busy = false;
    this.continue = false;
  },
  collectPensForProcessing: function collectPensForProcessing(cb) {
    _database2.default.models.Pen.find({
      // lastUsed: {'$gt': Date.now() - 3600000 } // 1 hour.
    }, { id: true }, function (err, pens) {

      pens.forEach(function (pen) {
        Scraper.queue.push(pen.id);
      });

      cb();
    });
  },
  getInformationFromPen: function getInformationFromPen(pen, cb) {
    // Clever url with will be converted by codepen.
    var url = 'http://codepen.io/pen/details/' + pen;

    // Get only the headers.
    (0, _request2.default)({
      url: url,
      jar: Scraper.jar
    }, function (error, response, html) {
      var path = response.req.path;

      var parts = path.split('/');

      var ownerHash = parts[1];

      if (error) {
        throw error;
      }

      var $ = _cheerio2.default.load(html);

      var views = $('.single-stat.views').html();
      views = views.split('\n')[1];
      views = Number(views);

      var comments = $('.single-stat.comments').html();
      comments = comments.split('\n')[1];
      comments = Number(comments);

      var likes = $('.single-stat.loves > .count').html();
      likes = Number(likes);

      var owner = $('.pen-owner-name').html();
      owner = owner.replace(/\n\ +/g, '');

      var title = $('.pen-title-link').html();
      title = title.replace(/\n\ +/g, '');

      var timestamps = $('#details-tab-description .dateline time');
      var createdAt = new Date(timestamps[0].attribs.datetime).getTime();

      var modifiedAt = undefined;
      if (timestamps[1]) {
        modifiedAt = new Date(timestamps[1].attribs.datetime).getTime();
      }

      if (cb) {
        Scraper.storeInformationInDatabase(pen, {
          views: views, likes: likes, comments: comments, ownerHash: ownerHash, owner: owner, title: title, createdAt: createdAt, modifiedAt: modifiedAt }, cb);
      }
    });
  },
  storeInformationInDatabase: function storeInformationInDatabase(pen, data, cb) {
    var _$set;

    // Set time to midnight.
    var day = new Date();
    day.setHours(0, 0, 0, 0);
    day = day.getTime();

    _database2.default.models.Pen.findOneAndUpdate({ id: pen }, {
      title: data.title,
      owner: {
        hash: data.ownerHash,
        full: data.owner
      },
      createdAt: data.createdAt,
      modifiedAt: data.modifiedAt,

      '$set': (_$set = {}, _defineProperty(_$set, 'likes.' + day, data.likes), _defineProperty(_$set, 'views.' + day, data.views), _defineProperty(_$set, 'comments.' + day, data.comments), _$set)
    }, { upsert: true, setDefaultsOnInsert: true, new: true }, function (err, pen) {
      if (err) {
        console.log(err);
        cb(new Error('Data could not be saved!'));
        return;
      }
      cb(null, pen);
    });
  }
};

// Run once an hour.
Scraper.start();

setInterval(function () {
  Scraper.start();
}, 3600000);

exports.default = Scraper;