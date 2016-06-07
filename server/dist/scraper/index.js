'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Scraper = {
  jar: _request2.default.jar(),

  // Pen.
  scrape: function scrape(id, cb) {
    var url = 'http://codepen.io/thesuitcase/details/' + id;
    console.log('[Scraper]' + url);

    (0, _request2.default)({
      url: url,
      jar: Scraper.jar
    }, function (error, response, html) {
      console.log(error);
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

      cb({ views: views, likes: likes, comments: comments });
    });
  }
};

exports.default = Scraper;