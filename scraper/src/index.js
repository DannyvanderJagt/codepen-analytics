import Database from '../../server/dist/database';
import Request from 'request'
import Cheerio from 'cheerio'
import FileCookieStore from 'tough-cookie-filestore';
import Path from 'path';
import Fs from 'fs-extra';

// Path for cookies files.
let cookiesPath = Path.join(__dirname, '../',  'cookies.json');

// Ensure cookie file.
Fs.ensureFileSync(cookiesPath)

let Scraper = {
  jar: Request.jar(new FileCookieStore(cookiesPath)),

  queue: [],
  busy: false,
  continue: false,
  start(){
    if(this.busy){ return; }
    this.queue = [];
    this.continue = true;
    this.busy = true;

    this.collectPensForProcessing(() => {
      this.next();
    }); 
  },

  next(){
    if(this.queue.length === 0){ 
      this.stop();
      return; 
    }
    if(this.continue === false){ 
      this.stop();
      return; 
    }

    this.busy = true;
    this.continue = true;

    let pen = this.queue.splice(0,1);

    this.getInformationFromPen(pen, (err, data) => {
      this.next();
    })
  },

  stop(){
    if(!this.busy){ return; }
    this.busy = false;
    this.continue = false;
  },


  collectPensForProcessing(cb){
    Database.models.Pen.find(
      {
        lastUsed: {'$gt': Date.now() - 3600000 } // 1 hour.
      }, 
      {id: true},
      (err, pens) => {

        pens.forEach((pen) => {
          Scraper.queue.push(pen.id);
        })

        cb();
      }
    )
  },

  getInformationFromPen(pen, cb){
    // Clever url with will be converted by codepen.
    let url = 'http://codepen.io/pen/details/' + pen;

    // Get only the headers.
    Request({
      url, 
      jar: Scraper.jar,
    }, (error, response, html) => {
      let path = response.req.path;

      let parts = path.split('/')

      let ownerHash = parts[1];

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

      let owner = $('.pen-owner-name').html();
      owner = owner.replace(/\n\ +/g, '');

      let title = $('.pen-title-link').html();
      title = title.replace(/\n\ +/g, '');

      if(cb){
        Scraper.storeInformationInDatabase(pen, {views, likes, comments, ownerHash, owner, title}, cb);
      }
    })
  },

  storeInformationInDatabase(pen, data, cb){
    Database.models.Pen.findOneAndUpdate(
      {id: pen}, 
      {
        likes: data.likes,
        views: data.views,
        comments: data.comments,
        title: data.title,
        owner: {
          hash: data.ownerHash,
          full: data.owner
        }
      },
      {upsert: true, setDefaultsOnInsert: true, new: true}, 
      (err, pen) => {
        if(err){
          cb(new Error('Data could not be saved!'))
          return;
        }
        cb(null, pen)
      }
    );
    
  }
}

// Run once an hour.
Scraper.start();

setInterval(() => {
  Scraper.start();
}, 3600000) 


// Database.models.Pen.find(
//   {},
//   (err, pens){
//     console.log(pens);
//   }
// );

// console.log(Scraper.jar)

// Scraper.getInformationFromPen('WrdQrr', (data) => {
//   console.log(data);
//   Scraper.storeInformationInDatabase('WrdQrr', data, (err, pen) => {
//     console.log('stored', err, pen)
//   })
// //   Scraper.close();
// //   // Execute request sync for cookie jar.
// //   // Scraper.getInformationFromPen('WrdQrr', (data) => {
// //   //   console.log(data);
// //   // });
// });



export default Scraper;