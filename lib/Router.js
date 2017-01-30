"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require("react");
var Util_1 = require("./Util");
var Router = (function (_super) {
    __extends(Router, _super);
    function Router(props) {
        var _this = _super.call(this, props) || this;
        _this._doneSetup = false;
        _this._routeDefs = [];
        _this._pendingRedirect = null;
        _this._routeIndices = {};
        _this._activeRoute = null;
        _this.PATH_SEP = props.pathSep || '/';
        _this._routeData = Util_1.createDataStore();
        _this.state = props.initialState || {
            currentRoute: props.initialRoute || '',
        };
        Util_1.traverse(props.children, _this, [], props.rootPath || '');
        return _this;
    }
    Router.prototype.setRouteData = function (data) {
        this._routeData.set(this.state.currentRoute, data);
    };
    Router.prototype.getRouteData = function () {
        return this._routeData.get(this.state.currentRoute);
    };
    Router.prototype.getDataForRoute = function (route) {
        return this._routeData[route];
    };
    Router.prototype.getCurrentRoute = function () {
        return this.state.currentRoute;
    };
    Router.prototype.getPrevRoute = function () {
        return this.state.prevRoute;
    };
    Router.prototype.onRouteChange = function (prevRoute, nextRoute) {
        this.setState({
            prevRoute: prevRoute,
            currentRoute: nextRoute
        });
    };
    Router.prototype.getDataStore = function () {
        return this._routeData;
    };
    Router.prototype.getRouteDef = function (path) {
        return this._routeDefs[this._routeIndices[path]];
    };
    Router.prototype.routeDefFromPath = function (path, hasChildren, props, renderStack) {
        var temp = null;
        if (temp = this._routeIndices[path]) {
            return this._routeDefs[temp];
        }
        var route = Util_1.parseRoute(path, hasChildren, props, renderStack);
        this._routeDefs.push(route);
        this._routeIndices[path] = this._routeDefs.length - 1;
        return (route);
    };
    Router.prototype.setGuard = function (guard) {
        this.props.history.setGuard(guard);
    };
    Router.prototype._checkRedirect = function () {
        if (this._pendingRedirect) {
            var redirect = this._pendingRedirect;
            this._pendingRedirect = null;
            this.props.history.goTo(redirect.props('to'));
        }
    };
    Router.prototype.componentDidUpdate = function (prevProps, prevState) {
        this._checkRedirect();
        if (this.props.onRouteChange) {
            if (prevState.currentRoute !== this.state.currentRoute) {
                this.props.onRouteChange(this._activeRoute, this._activeRoute.test(this.state.currentRoute));
            }
        }
    };
    Router.prototype.componentDidMount = function () {
        this._checkRedirect();
        if (this.props.onRouteChange) {
            this.props.onRouteChange(this._activeRoute, this._activeRoute.test(this.state.currentRoute));
        }
    };
    Router.prototype.render = function () {
        var currentRoute = this.state.currentRoute;
        var z = Util_1.find(this._routeDefs, function (e, i) {
            return e.test(currentRoute) !== null;
        });
        if (z) {
            if (z.isRedirect()) {
                this._pendingRedirect = z;
                return null;
            }
            this._activeRoute = z;
            return z.render();
        }
        return null;
    };
    return Router;
}(React.Component));
exports.Router = Router;
