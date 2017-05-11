"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var Route_1 = require("./Route");
/**
 * An identity function i.e. returns whatever it receives in its first paramters.
 */
function identity(v) {
    return v;
}
exports.identity = identity;
/**
 * A getter setter generator.
 * Given an object, it returns a function that can be used to get
 * or set properties of the object.
 */
function getSet(obj) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 0) {
            return obj;
        }
        else if (args.length === 1) {
            if (typeof args[0] === "string") {
                return obj[args[0]];
            }
            else if (typeof args[0] === "object" &&
                !(args[0] instanceof Array)) {
                obj = __assign({}, obj, args[0]);
            }
            else if (typeof args[0] === "object" &&
                args[0] instanceof Array) {
                return args[0].map(function (e) {
                    return obj[e];
                });
            }
        }
        else if (args.length === 2) {
            obj[args[0]] = args[1];
            return;
        }
    };
}
exports.getSet = getSet;
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
/**
 * Creates a simple local {@link DataStore}.
 */
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
/**
 * Parases a route with path parameters.
 * @param {string} path the path to parse.
 * @returns {ParsedRoute} the parsed route.
 */
function parseRoute(path) {
    var params = [];
    var regex = path.replace(/:([^\s\/]+):(number|string|boolean)/g, function (e, k, v) {
        params.push([k, v]);
        return exports.TYPES_TO_REGEX[v];
    }).replace(/:([^\s\/]+)/g, function (e, k) {
        params.push([k, "string"]);
        return exports.TYPES_TO_REGEX["string"];
    });
    return {
        regex: regex,
        routeParams: params,
    };
}
exports.parseRoute = parseRoute;
function createRouteDef(cfg) {
    cfg.route = cfg.route.replace(/[\/]{2,}/g, '/');
    var route = cfg.route, renderStack = cfg.renderStack, authenticate = cfg.authenticate, props = cfg.props, isRedirect = cfg.isRedirect, isAuth = cfg.isAuth, hasChildren = cfg.hasChildren;
    var _a = parseRoute(route), regex = _a.regex, routeParams = _a.routeParams;
    var params = {};
    var stack = renderStack.slice(0);
    var innerChild = stack.pop();
    var routeData = null;
    if (hasChildren) {
        regex += ".*";
    }
    var reg = new RegExp("^" + regex + "$", 'i');
    function debug() {
        console.log(reg, regex, stack);
    }
    function test(path) {
        reg.lastIndex = 0;
        var matches = path.match(reg);
        if (matches && matches.length) {
            return (params = getParamsFromMatches(routeParams, matches, route, path));
        }
        return null;
    }
    function data(data) {
        if (arguments.length === 0) {
            return routeData;
        }
        routeData = data;
    }
    function _props(key) {
        return props[key];
    }
    function inject(dataStore, component, props) {
        var $inject = component.$inject;
        props.routeParams = params;
        if (typeof $inject === "object" && $inject.length) {
            $inject.forEach(function (e) {
                props[e] = dataStore.get(e);
            });
        }
    }
    function render(dataStore) {
        if (isRedirect) {
            return null;
        }
        var $inject;
        if (stack.length === 0) {
            inject(dataStore, innerChild[0], innerChild[1]);
            return React.createElement(innerChild[0], innerChild[1]);
        }
        else {
            inject(dataStore, innerChild[0], innerChild[1]);
            return stack.reduceRight(function (prev, current, a, b) {
                inject(dataStore, current[0], current[1]);
                return (React.createElement(current[0], current[1], prev));
            }, React.createElement(innerChild[0], innerChild[1]));
        }
    }
    function auth(router, dataStore, callback) {
        if (isAuth) {
            if (authenticate) {
                authenticate(router, dataStore, callback);
                return;
            }
            callback(true);
        }
        callback(true);
    }
    var o = {
        debug: debug,
        test: test,
        route: route,
        data: data,
        auth: auth,
        onEnter: cfg.onEnter || (stack.length && stack[0] && stack[0].length && stack[0][0].onEnter),
        onLeave: cfg.onLeave || (stack.length && stack[0] && stack[0].length && stack[0][0].onEnter),
        props: _props,
        isRedirect: isRedirect,
        isAuth: isAuth,
        render: render
    };
    return o;
}
exports.createRouteDef = createRouteDef;
/**
 * An implementation of the ES6 find method.
 * @param {T[]} array the array to loop through.
 * @param {IteratorCallback<T>} fn the iterator to call on every item in
 * the array up until the method returns a truthful value.
 */
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
        child.props.props = child.props.props || {};
        child.props.props.router = router;
        child.props.props.dataStore = router.getDataStore();
        renderStack.push([child.props.component, child.props.props]);
        if (hasChildren) {
            traverse(child.props.children, router, renderStack, [parentPath, childPath].join(pathSep));
        }
        var x = null;
        if (child.type === Route_1.IndexRoute) {
            x = router.routeDefFromPath({
                route: parentPath + pathSep + '?',
                hasChildren: false,
                props: child.props,
                renderStack: renderStack,
                isRedirect: false,
                isAuth: false,
                onEnter: child.props.onEnter,
                onLeave: child.props.onLeave
            });
        }
        else if (child.type === Route_1.NotFoundRoute) {
            x = router.routeDefFromPath({
                route: [parentPath, ':route:any'].join(pathSep),
                hasChildren: false,
                props: child.props,
                renderStack: renderStack,
                isRedirect: false,
                isAuth: false,
                onEnter: child.props.onEnter,
                onLeave: child.props.onLeave
            });
        }
        else if (child.type === Route_1.Redirect && child.props.to && child.props.to.length > 0) {
            x = router.routeDefFromPath({
                route: [parentPath, childPath].join(pathSep),
                hasChildren: false,
                props: child.props,
                renderStack: renderStack,
                isRedirect: true,
                isAuth: false,
                onEnter: child.props.onEnter,
                onLeave: child.props.onLeave
            });
        }
        else if (child.type === Route_1.AuthRoute && child.props.auth) {
            x = router.routeDefFromPath({
                route: [parentPath, childPath].join(pathSep),
                hasChildren: hasChildren,
                props: child.props,
                renderStack: renderStack,
                isRedirect: false,
                isAuth: true,
                authenticate: child.props.auth,
                onEnter: child.props.onEnter,
                onLeave: child.props.onLeave
            });
        }
        else {
            x = router.routeDefFromPath({
                route: [parentPath, childPath].join(pathSep),
                hasChildren: hasChildren,
                props: child.props,
                renderStack: renderStack,
                isRedirect: false,
                isAuth: false
            });
        }
        renderStack.pop();
        return x;
    });
}
exports.traverse = traverse;
