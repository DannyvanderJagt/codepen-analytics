/** 
 * Pens Routes
 * format: /pen/:id
 * extentions: .js/.json/.xml
 */

import Express from 'express'
import DeviceParser from 'express-device'
import Libs from '../../libs';
import UAParser from 'ua-parser-js';
import Keys from '../../keys';
import Database from '../../database';
import Path from 'path';

// Router
let route = Express.Router()

// Middleware
route.use(DeviceParser.capture())

// Routes
route.get('/:id.js', (req, res, next) => {

  let unique = Keys.generateUniqueKey();

  let item = new Database.models.Identifier({
    id: unique,
    pen: req.params.id,
  }).save();


  res.send(
    Libs.getJavascriptForPen(unique)
  )
})


route.get('/:id.json', (req, res, next) => {
  Database.models.Pen.findOne({id: req.params.id}, (err, pen) => {
    res.set('Content-Type', 'text/json');
    res.json(pen);
    return;
  });
})

route.get('/post', (req, res, next) => {
  // Only allow request from codepen.io with matching id's!
  let query = req.query;


  // let cookie = req.cookies.pens;

  // if(cookie){
  //   console.log(cookie, query.uni);
  // }else{
  //   res.cookie('pens', `[${req.params.id}]`)
  // }


  // res.cookie('pens', '[]');


  // Abstract User Agent.
  let result = new UAParser()
            .setUA(req.get('user-agent'))
            .getResult()

  // Combine data.
  result.uniqueid = query.uniqueid;
  
  result.display = {
    width: query['display_width'],
    height: query['display_height'],
    colorDepth: query['display_colordepth'],
    pixelDepth: query['display_pixeldepth']
  }

  result.window = {
    width: query['window_width'],
    height: query['window_height'],
    devicePixelRatio: query['window_devicepixelratio']
  }

  if(!result.device.type){
    result.device.type = req.device.type || undefined;
  }

  // Set cookie
  res.cookie('visited', 'hi')



  // Check the unique id.
  Database.models.Identifier.findOne({id: result.uniqueid}, (err, item) => {
    if(err){
      res.json(`[{"valid": false}]`)
      return;
    }

    // Process data.
    Database.models.Pen.findOne({id: item.pen}, (err, pen) => {
      if(pen === null){
        new Database.models.Pen({
          id: item.pen
        }).save()
        return;
      }

      // Store data.
      pen.update({
        $inc: { 
          [`browsers.total`]: 1,
          [`browsers.${result.browser.name.toLowerCase()}.total`]: 1,
          [`browsers.${result.browser.name.toLowerCase()}.major.${result.browser.major}`]: 1,
          [`browsers.${result.browser.name.toLowerCase()}.minor.${result.browser.version.replace(/\./g, '-')}`]: 1,
          
          [`devices.total`]: 1,
          [`devices.${result.device.type}`]: 1,
          
          [`displays.total`]: 1,
          [`displays.sizes.${result.display.width}x${result.display.height}`]:1,
          [`displays.colordepth.${result.display.colorDepth}`]:1,
          [`displays.pixeldepth.${result.display.pixelDepth}`]:1,

          [`windows.total`]: 1,
          [`windows.sizes.${result.window.width}x${result.window.height}`]:1,
          [`windows.devicePixelRatios.${result.window.devicePixelRatio}`]:1, 
        }
      },
      (err, data) => {
        // console.log('update', err, data)
      })

    })

  })

  
  res.json(`[{"valid": true}]`)
})

route.get('/:id', (req, res, next) => {
  Database.models.Pen.findOne({id: req.params.id}, (err, pen) => {
    res.render('pen', pen);
    return;
  });
})

export default route
