import Request from 'request'
import Cheerio from 'cheerio'

let Scraper = {
  jar: Request.jar(),

  // Pen.
  scrape(id, cb) {
    let url = 'http://codepen.io/thesuitcase/details/' + id
    console.log('[Scraper]' + url)

    Request({
      url,
      jar: Scraper.jar,
    }, (error, response, html) => {
      console.log(error)
      if (error) { throw error; }

      let $ = Cheerio.load(html)

      let views = $('.single-stat.views').html()
      views = views.split('\n')[1]
      views = Number(views)

      let comments = $('.single-stat.comments').html()
      comments = comments.split('\n')[1]
      comments = Number(comments)

      let likes = $('.single-stat.loves > .count').html()
      likes = Number(likes)

      cb({views, likes, comments})
    })
  }
}

export default Scraper
