import Path from 'path'

import Express from 'express'
// import Favicon from 'serve-favicon'
import Config from '../config'
import CookieParser from 'cookie-parser';

// Routers
import PenRouter from './routers/pen'
import Uid from 'thesuitcase-uid';

let Secret = 'wc6x2pbp971rtfuuy6ybx2ds'; //Uid(4);
console.log('[Server] Cookie secret: ', Secret)

let app = Express()

// Config.
app.set('view engine', 'pug')
app.set('views', Path.join(__dirname, '../../../content'))

app.use(CookieParser());

// Favicon
// app.use(Favicon(path.join(__dirname, '../../content/images/favicon.ico')))

// Pages
app.use(Express.static(Path.join(__dirname, '../../../content')))

/** 
 * Pens Routes
 * format: /pen/:id
 * extentions: .js/.json/.xml
 */
app.use('/pen', PenRouter)


// Start the server.
let server = app.listen(Config.port, function () {
  console.log(`[Server] ${Config.port}`)
})
