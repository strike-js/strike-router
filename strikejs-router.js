/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Router_1 = __webpack_require__(1);
	exports.Router = Router_1.Router;
	var Route_1 = __webpack_require__(4);
	exports.Route = Route_1.Route;
	exports.IndexRoute = Route_1.IndexRoute;
	exports.NotFoundRoute = Route_1.NotFoundRoute;
	exports.Redirect = Route_1.Redirect;
	var History_1 = __webpack_require__(5);
	exports.hashHistory = History_1.hashHistory;
	exports.popStateHistory = History_1.popStateHistory;
	var Util_1 = __webpack_require__(3);
	exports.identity = Util_1.identity;
	exports.createDataStore = Util_1.createDataStore;
	(function (StrikeJS) {
	    if (window) {
	        StrikeJS.Router = Router_1.Router;
	        StrikeJS.IndexRoute = Route_1.IndexRoute;
	        StrikeJS.NotFoundRoute = Route_1.NotFoundRoute;
	        StrikeJS.Redirect = Route_1.Redirect;
	        StrikeJS.hashHistory = History_1.hashHistory;
	        StrikeJS.identity = Util_1.identity;
	        StrikeJS.popStateHistory = History_1.popStateHistory;
	        StrikeJS.createDataStore = Util_1.createDataStore;
	    }
	}(window.StrikeJS = window.StrikeJS || {}));


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var React = __webpack_require__(2);
	var Util_1 = __webpack_require__(3);
	var Router = (function (_super) {
	    __extends(Router, _super);
	    function Router(props) {
	        var _this = _super.call(this, props) || this;
	        _this._doneSetup = false;
	        _this._routeDefs = [];
	        _this._pendingRedirect = null;
	        _this._routeIndices = {};
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
	    Router.prototype.componentDidUpdate = function () {
	        this._checkRedirect();
	    };
	    Router.prototype.componentDidMount = function () {
	        this._checkRedirect();
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
	        }
	        if (z && !z.isRedirect()) {
	            return z.render();
	        }
	        return null;
	    };
	    return Router;
	}(React.Component));
	exports.Router = Router;


/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = React;

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var React = __webpack_require__(2);
	var Route_1 = __webpack_require__(4);
	function identity(v) {
	    return v;
	}
	exports.identity = identity;
	exports.TYPES_TO_PARSE = {
	    "number": parseFloat,
	    "string": identity,
	    "boolean": function (v) {
	        if (v.toLowerCase() === "true") {
	            return true;
	        }
	        return false;
	    }
	};
	exports.TYPES_TO_REGEX = {
	    "number": '([0-9\.]+)',
	    "string": '([^\\s\\/]+)',
	    "any": '([\\s\\S]+)',
	    "boolean": '(true|false|TRUE|FALSE)',
	    "alphanumeric": '([a-zA-Z0-9]+)',
	};
	function createDataStore() {
	    var data = {};
	    function get(key) {
	        return data[key];
	    }
	    function set(key, val) {
	        data[key] = val;
	    }
	    return {
	        get: get,
	        set: set
	    };
	}
	exports.createDataStore = createDataStore;
	function getParamsFromMatches(params, matches, route, path) {
	    var i = 0, data = {
	        route: route,
	        path: path
	    }, l = params.length;
	    if (matches && matches.length) {
	        for (; i < l; i++) {
	            data[params[i][0]] = exports.TYPES_TO_PARSE[params[i][1]](matches[i + 1]);
	        }
	    }
	    return data;
	}
	exports.getParamsFromMatches = getParamsFromMatches;
	function parseRoute(route, hasChildren, elemProps, renderStack, isRedirect) {
	    if (isRedirect === void 0) { isRedirect = false; }
	    var routeParams = [];
	    var stack = renderStack.slice(0);
	    var routeData = null;
	    var r = route.replace(/:([^\s\/]+):(number|string|boolean)/g, function (e, k, v) {
	        routeParams.push([k, v]);
	        return exports.TYPES_TO_REGEX[v];
	    }).replace(/:([^\s\/]+)/g, function (e, k) {
	        routeParams.push([k, "string"]);
	        return exports.TYPES_TO_REGEX["string"];
	    });
	    if (hasChildren) {
	        r += ".*";
	    }
	    function debug() {
	        console.log(reg, r, stack);
	    }
	    function test(path) {
	        reg.lastIndex = 0;
	        var matches = path.match(reg);
	        if (matches && matches.length) {
	            return getParamsFromMatches(routeParams, matches, route, path);
	        }
	        return null;
	    }
	    function data(data) {
	        if (arguments.length === 0) {
	            return routeData;
	        }
	        routeData = data;
	    }
	    function props(key) {
	        return elemProps[key];
	    }
	    function _isRedirect() {
	        return isRedirect;
	    }
	    function render() {
	        if (isRedirect) {
	            return null;
	        }
	        if (stack.length === 1) {
	            return React.createElement(stack[0][0], stack[0][1]);
	        }
	        else {
	            return stack.reduceRight(function (prev, current, a, b) {
	                return (React.createElement(current[0], current[1], prev.length ? React.createElement(prev[0], prev[1]) : prev));
	            });
	        }
	    }
	    var reg = new RegExp("^" + r + "$", 'i');
	    var o = {
	        debug: debug,
	        test: test,
	        data: data,
	        props: props,
	        isRedirect: _isRedirect,
	        render: render
	    };
	    return o;
	}
	exports.parseRoute = parseRoute;
	function find(array, fn) {
	    var i = 0, l = array.length;
	    for (; i < l; i++) {
	        if (fn(array[i], i)) {
	            return array[i];
	        }
	    }
	    return null;
	}
	exports.find = find;
	var countChildren = React.Children.count;
	function traverse(children, router, renderStack, parentPath) {
	    if (parentPath === void 0) { parentPath = ''; }
	    var pathSep = router.PATH_SEP;
	    return React.Children.map(children, function (child, index) {
	        var hasChildren = countChildren(child.props.children) > 0, childPath = child.props.path;
	        child.props.props.router = router;
	        renderStack.push([child.props.component, child.props.props]);
	        if (hasChildren) {
	            traverse(child.props.children, router, renderStack, [parentPath, childPath].join(pathSep));
	        }
	        var x = null;
	        if (child.type === Route_1.IndexRoute) {
	            x = router.routeDefFromPath(parentPath, false, child.props, renderStack);
	        }
	        else if (child.type === Route_1.NotFoundRoute) {
	            x = router.routeDefFromPath([parentPath, ':route:any'].join(pathSep), false, child.props, renderStack);
	        }
	        else if (child.type === Route_1.Redirect && child.props.to && child.props.to.length > 0) {
	            x = router.routeDefFromPath([parentPath, ':route:any'].join(pathSep), false, child.props, renderStack, true);
	        }
	        else {
	            x = router.routeDefFromPath([parentPath, childPath].join(pathSep), false, child.props, renderStack);
	        }
	        renderStack.pop();
	        return x;
	    });
	}
	exports.traverse = traverse;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var React = __webpack_require__(2);
	var Route = (function (_super) {
	    __extends(Route, _super);
	    function Route(props) {
	        var _this = _super.call(this, props) || this;
	        _this.state = {};
	        return _this;
	    }
	    Route.prototype.render = function () {
	        return null;
	    };
	    return Route;
	}(React.Component));
	exports.Route = Route;
	var IndexRoute = (function (_super) {
	    __extends(IndexRoute, _super);
	    function IndexRoute(props) {
	        var _this = _super.call(this, props) || this;
	        _this.state = {};
	        return _this;
	    }
	    IndexRoute.prototype.render = function () {
	        return null;
	    };
	    return IndexRoute;
	}(React.Component));
	exports.IndexRoute = IndexRoute;
	var NotFoundRoute = (function (_super) {
	    __extends(NotFoundRoute, _super);
	    function NotFoundRoute(props) {
	        var _this = _super.call(this, props) || this;
	        _this.state = {};
	        return _this;
	    }
	    NotFoundRoute.prototype.render = function () {
	        return null;
	    };
	    return NotFoundRoute;
	}(React.Component));
	exports.NotFoundRoute = NotFoundRoute;
	var Redirect = (function (_super) {
	    __extends(Redirect, _super);
	    function Redirect(props) {
	        var _this = _super.call(this, props) || this;
	        _this.state = {};
	        return _this;
	    }
	    Redirect.prototype.render = function () {
	        return null;
	    };
	    return Redirect;
	}(React.Component));
	exports.Redirect = Redirect;


/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	function hashHistory() {
	    var currentIndex = 0, guard = null, history = [location.hash.substr(1)], enabled = true, delegate = null;
	    window.addEventListener('hashchange', onHashChange);
	    function onHashChange() {
	        if (enabled) {
	            currentIndex++;
	            var newHash = location.hash.substr(1);
	            if (currentIndex === history.length) {
	                history.push(newHash);
	            }
	            else {
	                history.splice(currentIndex);
	                history[currentIndex] = newHash;
	            }
	        }
	        enabled = true;
	        onChange();
	    }
	    function onChange() {
	        delegate && delegate.onRouteChange(history[currentIndex], currentIndex > 0 ? history[currentIndex - 1] : null);
	    }
	    function setDelegate(del) {
	        delegate = del;
	    }
	    function doBackNext(inc) {
	        enabled = false;
	        currentIndex += inc;
	        location.hash = history[currentIndex];
	    }
	    function doGoTo(path) {
	        enabled = false;
	        currentIndex++;
	        history.splice(currentIndex);
	        history.push(path);
	        location.hash = history[currentIndex];
	    }
	    function change(inc) {
	        var v = guard && guard.check();
	        if (typeof v === "object" && v && v.then) {
	            v.then(function (okay) {
	                if (okay) {
	                    doBackNext(inc);
	                }
	            });
	        }
	        else if ((typeof v === "boolean" && v) || !guard) {
	            doBackNext(inc);
	        }
	    }
	    function back() {
	        if (currentIndex > 0) {
	            change(-1);
	        }
	    }
	    function next() {
	        if (currentIndex < (history.length - 1)) {
	            change(1);
	        }
	    }
	    function goTo(path) {
	        if (guard) {
	            var v = guard.check();
	            if (typeof v === "object" && v && v.then) {
	                v.then(function (okay) {
	                    if (okay) {
	                        doGoTo(path);
	                    }
	                });
	                return;
	            }
	        }
	        doGoTo(path);
	    }
	    function prevRoute() {
	        return currentIndex > 0 ? history[currentIndex - 1] : null;
	    }
	    function currentRoute() {
	        return history[currentIndex];
	    }
	    function setGuard(g) {
	        guard = g;
	    }
	    return {
	        setDelegate: setDelegate,
	        currentRoute: currentRoute,
	        prevRoute: prevRoute,
	        history: history,
	        back: back,
	        next: next,
	        goTo: goTo,
	        setGuard: setGuard,
	    };
	}
	exports.hashHistory = hashHistory;
	function popStateHistory(root) {
	    var enabled = true, currentIndex = 0, guard = null, hist = [getRoute(location.pathname)], delegate = null;
	    window.addEventListener('popstate', onPopStateChange);
	    function getRoute(path) {
	        return path.replace(root, '') || '/';
	    }
	    function onPopStateChange(event) {
	        if (enabled) {
	            currentIndex++;
	            var newHash = getRoute(location.pathname);
	            if (currentIndex === history.length) {
	                hist.push(newHash);
	            }
	            else {
	                hist.splice(currentIndex);
	                hist[currentIndex] = newHash;
	            }
	        }
	        enabled = true;
	        onChange();
	    }
	    function onChange() {
	        delegate && delegate.onRouteChange(hist[currentIndex], currentIndex > 0 ? hist[currentIndex - 1] : null);
	    }
	    function setDelegate(del) {
	        delegate = del;
	    }
	    function doBackNext(inc) {
	        enabled = false;
	        currentIndex += inc;
	        inc === -1 ? window.history.back() : window.history.forward();
	    }
	    function change(inc) {
	        var v = guard && guard.check();
	        if (v && typeof v === "object") {
	            v.then(function (okay) {
	                if (okay) {
	                    doBackNext(inc);
	                }
	            });
	        }
	        else if (!guard || (typeof v === "boolean" && v)) {
	            doBackNext(inc);
	        }
	    }
	    function back() {
	        if (currentIndex > 0) {
	            change(-1);
	        }
	    }
	    function next() {
	        if (currentIndex < (hist.length - 1)) {
	            change(1);
	        }
	    }
	    function doGoTo(path) {
	        enabled = false;
	        currentIndex++;
	        if (currentIndex < hist.length) {
	            hist.splice(currentIndex);
	        }
	        window.history.pushState({
	            index: currentIndex
	        }, '', getRoute(path));
	    }
	    function goTo(path) {
	        var v = guard && guard.check(path);
	        if (typeof v === "object" && v.then) {
	            return v.then(function (okay) {
	                if (okay) {
	                    doGoTo(path);
	                }
	            });
	        }
	        else if (!guard || (typeof v === "boolean" && v)) {
	            doGoTo(path);
	        }
	    }
	    function prevRoute() {
	        return currentIndex > 0 ? hist[currentIndex - 1] : null;
	    }
	    function currentRoute() {
	        return getRoute(location.pathname);
	    }
	    function setGuard(g) {
	        guard = g;
	    }
	    return {
	        setDelegate: setDelegate,
	        currentRoute: currentRoute,
	        prevRoute: prevRoute,
	        history: [],
	        setGuard: setGuard,
	        back: back,
	        next: next,
	        goTo: goTo,
	    };
	}
	exports.popStateHistory = popStateHistory;


/***/ }
/******/ ]);