import { createStore, applyMiddleware, compose } from 'redux'//store creator, middleware function, redux Devtool function
import { createLogger } from 'redux-logger' //used for middleware to log to chrome console
import rootReducer from './reducers' //aggregator of reducers

//this is used to get output of actions into the chrome console
const loggerMiddleware = createLogger()
const middleware = []//used for additional middleware that we decide to add

// For Redux Dev Tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export default function configureStore(preloadedState) {
  return createStore(
    rootReducer, //reducers
    preloadedState,
    composeEnhancers(applyMiddleware(...middleware, loggerMiddleware)) //Redux dev tool with added middle-ware for console logging
  )
}
