import Express from 'express'
import DeviceParser from 'express-device'
import Handler from './index'

let Router = Express.Router();

//  Middleware.
Router.use(DeviceParser.capture())

// Note: Paths are added by the handler!

export default Router;