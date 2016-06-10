import Database from '../../database';
import Router from './router';
import Libs from '../../libs';
import Uid from 'thesuitcase-uid';
import Async from 'async';
import UAParser from 'ua-parser-js';

let Handler = {
  Router, 

  reject(res, type){

    switch(type){
      case 'json':
        res.json({valid: false});
        break;
    }

    return;
  },

  routerDidRequestForJavascript(req, res, next){
    let unique = Uid(4);

    let item = new Database.models.Identifier({
      id: unique,
      pen: req.params.id
    });

    // No need for waiting.
    item.save();

    // Render the javascript lib.
    res.send(
      Libs.getJavascriptForPen(unique)
    )
  },
  routerDidRequestForJson(req, res, next){
    if(!req.params.id){ 
      this.reject(res, 'json');
      return;
    }

    Database.models.Pen.findOneAndUpdate(
      {id: req.params.id}, 
      {
        lastUsed: Date.now(),
      },
      {new: true, fields: {_id: false, __v: false}}, 
      (err, pen) => {
        if(err || !pen){
          this.reject(res, 'json');
          return;
        }

        res.set('Content-Type', 'text/json');
        res.json(pen);
        return;
      }
    );

  },
  routerDidRequestForPage(req, res, next){
    if(!req.params.id){ 
      this.reject(res, 'json');
      return;
    }

    Database.models.Pen.findOneAndUpdate(
      {id: req.params.id}, 
      {
        lastUsed: Date.now(),
      },
      {new: true, fields: {_id: false, __v: false}}, 
      (err, pen) => {
        if(err || !pen){
          res.render('notfound');
          return;
        }

        res.render('pen', pen);
        return;
      }
    );
  },
  routerDidRequestForPost(req, res, next){
    if(!req.params.id){ 
      this.reject(res, 'json');
      return;
    }

    let cookies = req.cookies;
    let query = req.query;

    if(!query){
      this.reject(res, 'json');
      return;
    }

    Async.waterfall([
      Async.apply(
        this.validateUniqueID, 
        {
          req,
          res,
          next,
          params: req.params, 
          query,
          cookies,
        }
      ),
      this.setCookie,
      this.collectResult,
      this.updateDatabase,
    ], (err, result) => {
      if(err){
        result.res.json("[{valid: false}]")
        return;
      }
      
      result.res.json("[{valid: true}]")
    });
  }, 


  // Handle post requests.
  validateUniqueID(data, next){
    data.valid = false;

    Database.models.Identifier.findOne({id: data.params.id}, (err, item) => {
      if(!err && item && item.pen){
        data.pen = item.pen;
        data.valid = true;
        next(null, data);
        return;
      }

      next(new Error('Not Allowed!'), data);
    });
  },

  setCookie(data, next){
    let cookies = data.cookies;
    let pens = [];
    let expires = new Date(Date.now() + 360000);

    if(cookies['codepen-analytics']){
      pens = JSON.parse(cookies['codepen-analytics']);
    }    

    // Disabled: Cookies on safari not working due to iframe.
    if(pens.indexOf(data.pen) > -1){
      // next(new Error('already visited!'), data)
      // return;
    }

    pens.push(data.pen);
    
    // Expires in one day.
    data.res.cookie('codepen-analytics', JSON.stringify(pens));

    next(null, data)
  },

  collectResult(data, next){
    let result = {};
    // Parse the User Agent.
    result = new UAParser()
                  .setUA(data.req.get('user-agent'))
                  .getResult();

    // Abstract data from the query.
    result.display = {
      width: data.query['display_width'],
      height: data.query['display_height'],
      colorDepth: data.query['display_colordepth'],
      pixelDepth: data.query['display_pixeldepth']
    }

    result.window = {
      width: data.query['window_width'],
      height: data.query['window_height'],
      devicePixelRatio: data.query['window_devicepixelratio']
    }

    // Fallback for User Agent device type.
    if(!result.device.type){
      result.device.type = data.req.device.type || undefined;
    }

    data.result = result;
    next(null, data)
  },

  updateDatabase(data, next){
    let result = data.result;

    let day = new Date();
    day.setHours(0,0,0,0);
    day = day.getTime();

    result.browser.name = result.browser.name.toLowerCase();
    result.os.name = result.os.name.toLowerCase()
    result.os.name = result.os.name.replace(/\ +/g, '-');

    // Prepare data.
    let inc = {

      // Browser data.
      [`browsers.total.${result.browser.name}.total`]: 1,
      [`browsers.total.${result.browser.name}.major.${result.browser.major}`]: 1,
      [`browsers.total.${result.browser.name}.minor.${result.browser.version.replace(/\./g, '-')}`]: 1,

      [`browsers.${day}.${result.browser.name}.total`]: 1,
      [`browsers.${day}.${result.browser.name}.major.${result.browser.major}`]: 1,
      [`browsers.${day}.${result.browser.name}.minor.${result.browser.version.replace(/\./g, '-')}`]: 1,

      // Devices.
      [`devices.total.${result.device.type}`]: 1,
      [`devices.${day}.${result.device.type}`]: 1,

      // Displays.
      [`displays.total.sizes.${result.display.width}x${result.display.height}`]:1,
      [`displays.total.colordepth.${result.display.colorDepth}`]:1,
      [`displays.total.pixeldepth.${result.display.pixelDepth}`]:1,

      [`displays.${day}.sizes.${result.display.width}x${result.display.height}`]:1,
      [`displays.${day}.colordepth.${result.display.colorDepth}`]:1,
      [`displays.${day}.pixeldepth.${result.display.pixelDepth}`]:1,

      // // Windows.
      [`windows.total.sizes.${result.window.width}x${result.window.height}`]:1,
      [`windows.total.devicePixelRatios.${result.window.devicePixelRatio}`]:1,

      [`windows.${day}.sizes.${result.window.width}x${result.window.height}`]:1,
      [`windows.${day}.devicePixelRatios.${result.window.devicePixelRatio}`]:1,

      // // Engines
      [`engines.total.${result.engine.name.toLowerCase()}.total`]: 1,
      [`engines.total.${result.engine.name.toLowerCase()}.${result.engine.version.replace(/\./g, '-')}`]: 1,
    
      [`engines.${day}.${result.engine.name.toLowerCase()}.total`]: 1,
      [`engines.${day}.${result.engine.name.toLowerCase()}.${result.engine.version.replace(/\./g, '-')}`]: 1,
    

      // // Operation Systems.
      [`os.total.${result.os.name}.total`]: 1,
      [`os.total.${result.os.name}.${result.os.version.replace(/\./g, '-')}`]: 1,
      [`os.${day}.${result.os.name}.total`]: 1,
      [`os.${day}.${result.os.name}.${result.os.version.replace(/\./g, '-')}`]: 1,
    };
    
    // Process data.
    Database.models.Pen.findOneAndUpdate(
      {id: data.pen}, 
      {
        '$inc': inc,
        'lastUsed': Date.now(),
      },
      {upsert: true, setDefaultsOnInsert: true, new: true}, 
      (err, pen) => {
        if(err){
          console.log(err);
          next(new Error('Data could not be saved!'), data)
          return;
        }

        next(null, data);
      }
    );
  },
  
}

// Add paths.
Router.get('/:id.js', Handler.routerDidRequestForJavascript.bind(Handler))
Router.get('/:id.json', Handler.routerDidRequestForJson.bind(Handler))
Router.get('/:id', Handler.routerDidRequestForPage.bind(Handler))
Router.get('/post/:id', Handler.routerDidRequestForPost.bind(Handler))

export default Handler;


