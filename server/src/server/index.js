import Path from 'path'

import Express from 'express'
// import Favicon from 'serve-favicon'
import CookieParser from 'cookie-parser';
import Uid from 'thesuitcase-uid';
import Config from '../config'

// Handlers
import Pen from '../handlers/pen'

// Server.
let app = Express()

// Middleware.
app.set('view engine', 'pug')
app.set('views', Path.join(__dirname, '../../../content'))

app.use(CookieParser(Config.cookieSecret));

// Favicon
// app.use(Favicon(path.join(__dirname, '../../content/images/favicon.ico')))

// Basic Static files.
app.use(Express.static(Path.join(__dirname, '../../../content')))

/** 
 * Pen Routes
 */
app.use('/pen', Pen.Router)


// Start the server.
let server = app.listen(Config.port, function () {
  console.log(`[Server] ${Config.port}`)
})
