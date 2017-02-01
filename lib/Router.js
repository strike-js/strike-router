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
        /**
         *
         */
        _this._doneSetup = false;
        /**
         *
         */
        _this._routeDefs = [];
        /**
         *
         */
        _this._pendingRedirect = null;
        /**
         *
         */
        _this._routeIndices = {};
        /**
         *
         */
        _this._activeRoute = null;
        _this.PATH_SEP = props.pathSep || '/';
        _this._routeData = props.dataStore || Util_1.createDataStore();
        _this.state = props.initialState || {
            currentRoute: props.initialRoute || props.history.currentRoute(),
        };
        Util_1.traverse(props.children, _this, [], props.rootPath || '');
        props.history.setDelegate(_this);
        if (_this.state.currentRoute) {
            props.history.goTo(_this.state.currentRoute);
        }
        return _this;
    }
    Router.prototype.setRouteData = function (data, atKey) {
        this._routeData.set(atKey ? atKey : this.state.currentRoute, data);
    };
    Router.prototype.getRouteData = function (atKey) {
        return this._routeData.get(atKey ? atKey : this.state.currentRoute);
    };
    Router.prototype.getDataForRoute = function (route) {
        return this._routeData.get(route);
    };
    Router.prototype.getCurrentRoute = function () {
        return this.state.currentRoute;
    };
    Router.prototype.getPrevRoute = function () {
        return this.state.prevRoute;
    };
    Router.prototype.onRouteChange = function (currentRoute, prevRoute) {
        var history = this.props.history;
        var params = null;
        var z = Util_1.find(this._routeDefs, function (e, i) {
            return ((params = e.test(currentRoute)) !== null);
        });
        if (z) {
            this._routeData.set('routeParams', params);
            if (z.isRedirect) {
                history.goTo(z.props('to'));
                return;
            }
            else if (z.isAuth) {
                //@todo implement alternative view
                z.auth(this, this._routeData, function (okay, redirectTo, alternative) {
                    if (okay) {
                        this._activeRoute = z;
                        this.setState({
                            prevRoute: prevRoute,
                            currentRoute: currentRoute
                        });
                        return;
                    }
                    if (redirectTo && typeof redirectTo === "string") {
                        history.goTo(redirectTo);
                        return;
                    }
                    history.goTo(prevRoute);
                });
                return;
            }
            this._activeRoute = z;
            this.setState({
                prevRoute: prevRoute,
                currentRoute: currentRoute
            });
        }
    };
    Router.prototype.getDataStore = function () {
        return this._routeData;
    };
    Router.prototype.getRouteDef = function (path) {
        return this._routeDefs[this._routeIndices[path]];
    };
    Router.prototype.routeDefFromPath = function (cfg) {
        var temp = null;
        var path = cfg.route;
        if (temp = this._routeIndices[path]) {
            return this._routeDefs[temp];
        }
        var route = Util_1.createRouteDef(cfg);
        ;
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
        if (this.props.onRouteChange) {
            if (prevState.currentRoute !== this.state.currentRoute) {
                this.props.onRouteChange(this._activeRoute, this._activeRoute.test(this.state.currentRoute));
            }
        }
    };
    Router.prototype.componentDidMount = function () {
        if (this.props.onRouteChange) {
            this.props.onRouteChange(this._activeRoute, this._activeRoute.test(this.state.currentRoute));
        }
    };
    Router.prototype.render = function () {
        return this._activeRoute ? this._activeRoute.render(this.getDataStore()) : null;
    };
    return Router;
}(React.Component));
exports.Router = Router;
