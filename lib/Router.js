"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
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
        if (_this.state.currentRoute) {
            props.history.goTo(_this.state.currentRoute);
        }
        return _this;
    }
    /**
     * Sets the data at a given key or at the current route.
     * @param {any} data the data to store.
     * @param {string} [atKey] the key to store the data at. If not
     * provided, the current route path will be used instead.
     */
    Router.prototype.setRouteData = function (data, atKey) {
        this._routeData.set(atKey ? atKey : this.state.currentRoute, data);
    };
    /**
     * Returns the data at the current route or at a given key.
     * @param {string} [atKey] the key to get the data at.
     */
    Router.prototype.getRouteData = function (atKey) {
        return this._routeData.get(atKey ? atKey : this.state.currentRoute);
    };
    /**
     * Get the current route.
     * @returns {string} the current route.
     */
    Router.prototype.getCurrentRoute = function () {
        return this.state.currentRoute;
    };
    /**
     * Get the previous route.
     * @returns {string} the previous route.
     */
    Router.prototype.getPrevRoute = function () {
        return this.state.prevRoute;
    };
    Router.prototype._handleRouteChange = function (currentRoute, prevRoute) {
        var _this = this;
        var history = this.props.history;
        var active = this._activeRoute;
        var dS = this._routeData;
        var params = null;
        var z = Util_1.find(this._routeDefs, function (e, i) {
            return ((params = e.test(currentRoute)) !== null);
        });
        if (z && (currentRoute !== prevRoute)) {
            this._routeData.set('routeParams', params);
            active && active.onLeave && active.onLeave(dS, this);
            if (z.isRedirect) {
                this._activeRoute = z;
                z.onEnter && z.onEnter(dS, this);
                history.goTo(z.props('to'));
                return;
            }
            else if (z.isAuth) {
                //@todo implement alternative view
                z.auth(this, this._routeData, function (okay, redirectTo, alternative) {
                    if (okay) {
                        _this._activeRoute = z;
                        z.onEnter && z.onEnter(dS, _this);
                        _this.setState({
                            prevRoute: prevRoute,
                            currentRoute: currentRoute
                        });
                        return;
                    }
                    var redirectRoute = (typeof redirectTo === "string" && redirectTo) || z.props("redirectTo");
                    if (redirectRoute) {
                        location.hash = redirectRoute;
                        // history.goTo(redirectTo);
                        return;
                    }
                    history.goTo(prevRoute);
                });
                return;
            }
            this._activeRoute = z;
            z.onEnter && z.onEnter(dS, this);
            this.setState({
                prevRoute: prevRoute,
                currentRoute: currentRoute
            });
        }
    };
    Router.prototype.onRouteChange = function (currentRoute, prevRoute) {
        var _this = this;
        if (this.guard) {
            this.guard(currentRoute).then(function (okay) {
                if (okay) {
                    _this.guard = null;
                    _this._handleRouteChange(currentRoute, prevRoute);
                    return;
                }
                _this.props.history.back();
            }, function () {
                _this.props.history.back();
            });
            return;
        }
        this._handleRouteChange(currentRoute, prevRoute);
    };
    /**
     * Returns the data store of the router.
     * @returns {DataStore} the data store of the router.
     */
    Router.prototype.getDataStore = function () {
        return this._routeData;
    };
    /**
     * Get route definition of a given path.
     * @returns {RouteDef} the route definition or {undefined} if not found.
     */
    Router.prototype.getRouteDef = function (path) {
        return this._routeDefs[this._routeIndices[path]];
    };
    /**
     * Creates a RouteDef given a path configuration.
     * @param {RouteConfig} cfg the route configuration.
     * @returns {RouteDef}
     */
    Router.prototype.routeDefFromPath = function (cfg) {
        var temp = null;
        var path = cfg.route;
        if (typeof (temp = this._routeIndices[path]) !== "undefined") {
            return this._routeDefs[temp];
        }
        var route = Util_1.createRouteDef(cfg);
        ;
        this._routeDefs.push(route);
        this._routeIndices[path] = this._routeDefs.length - 1;
        return (route);
    };
    /**
     * Sets a guard at the current route.
     * @param {RouteGuard} guard the guard to protect the current route.
     */
    Router.prototype.setGuard = function (guard) {
        this.guard = guard;
        // this.props.history.setGuard(guard);
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
        // if (this.props.onRouteChange){
        //     this.props.onRouteChange(this._activeRoute,this._activeRoute.test(this.state.currentRoute));
        // }
        this.props.history.setDelegate(this);
    };
    Router.prototype.componentWillReceiveProps = function (nextProps) {
        if (nextProps.children !== this.props.children) {
            this._routeDefs = [];
            this._routeIndices = {};
            Util_1.traverse(nextProps.children, this, [], nextProps.rootPath || '');
            this.setState({
                currentRoute: nextProps.history.currentRoute()
            });
        }
    };
    Router.prototype.render = function () {
        return this._activeRoute ? this._activeRoute.render(this.getDataStore()) : null;
    };
    return Router;
}(React.Component));
exports.Router = Router;
