import { Router } from './Router';
import { Route, IndexRoute, NotFoundRoute, Redirect } from './Route';
import { hashHistory, popStateHistory } from './History';
import { identity, createDataStore } from './Util';
export { Router, Route, IndexRoute, NotFoundRoute, Redirect, hashHistory, popStateHistory, identity, createDataStore };
(function (StrikeJS) {
    if (window) {
        StrikeJS.Router = Router;
        StrikeJS.IndexRoute = IndexRoute;
        StrikeJS.NotFoundRoute = NotFoundRoute;
        StrikeJS.Redirect = Redirect;
        StrikeJS.hashHistory = hashHistory;
        StrikeJS.identity = identity;
        StrikeJS.popStateHistory = popStateHistory;
        StrikeJS.createDataStore = createDataStore;
    }
}(window.StrikeJS = window.StrikeJS || {}));
