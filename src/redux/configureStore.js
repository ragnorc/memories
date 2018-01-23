// @flow
import { createStore, applyMiddleware, compose } from "redux";
import thunk from "redux-thunk";
import promise from "redux-promise";
import createLogger from "redux-logger";
import reducers from "./ducks/reducer";

export default function configureStore(initialState: any = undefined) {
  const logger = createLogger();
  /* Logger not included  due to perfomance issues with RNRF*/
  const enhancer = compose(applyMiddleware(thunk, promise, logger));
  return createStore(reducers, initialState, enhancer);
}
