"use strict";
var Router_1 = require("./Router");
exports.Router = Router_1.Router;
var Route_1 = require("./Route");
exports.Route = Route_1.Route;
exports.IndexRoute = Route_1.IndexRoute;
exports.NotFoundRoute = Route_1.NotFoundRoute;
exports.Redirect = Route_1.Redirect;
exports.AuthRoute = Route_1.AuthRoute;
var History_1 = require("./History");
exports.hashHistory = History_1.hashHistory;
exports.popStateHistory = History_1.popStateHistory;
var Util_1 = require("./Util");
exports.identity = Util_1.identity;
exports.createDataStore = Util_1.createDataStore;
exports.getSet = Util_1.getSet;
exports.parseRoute = Util_1.parseRoute;
(function (StrikeJS) {
    if (window) {
        StrikeJS.Router = Router_1.Router;
        StrikeJS.IndexRoute = Route_1.IndexRoute;
        StrikeJS.NotFoundRoute = Route_1.NotFoundRoute;
        StrikeJS.Redirect = Route_1.Redirect;
        StrikeJS.hashHistory = History_1.hashHistory;
        StrikeJS.identity = Util_1.identity;
        StrikeJS.AuthRoute = Route_1.AuthRoute;
        StrikeJS.popStateHistory = History_1.popStateHistory;
        StrikeJS.createDataStore = Util_1.createDataStore;
    }
}(window.StrikeJS = window.StrikeJS || {}));
