var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import * as React from 'react';
import { IndexRoute, NotFoundRoute, Redirect, AuthRoute } from './Route';
/**
 * An identity function i.e. returns whatever it receives in its first paramters.
 */
export function identity(v) {
    return v;
}
/**
 * A getter setter generator.
 * Given an object, it returns a function that can be used to get
 * or set properties of the object.
 */
export function getSet(obj) {
    return function (...args) {
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
                return args[0].map((e) => {
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
export const TYPES_TO_PARSE = {
    "number": parseFloat,
    "string": identity,
    "boolean": (v) => {
        if (v.toLowerCase() === "true") {
            return true;
        }
        return false;
    }
};
export const TYPES_TO_REGEX = {
    "number": '([0-9\.]+)',
    "string": '([^\\s\\/]+)',
    "any": '([\\s\\S]+)',
    "boolean": '(true|false|TRUE|FALSE)',
    "alphanumeric": '([a-zA-Z0-9]+)',
};
/**
 * Creates a simple local {@link DataStore}.
 */
export function createDataStore() {
    var data = {};
    function get(key) {
        return data[key];
    }
    function set(key, val) {
        data[key] = val;
    }
    return {
        get,
        set
    };
}
export function getParamsFromMatches(params, matches, route, path) {
    let i = 0, data = {
        route,
        path
    }, l = params.length;
    if (matches && matches.length) {
        for (; i < l; i++) {
            data[params[i][0]] = TYPES_TO_PARSE[params[i][1]](matches[i + 1]);
        }
    }
    return data;
}
/**
 * Parases a route with path parameters.
 * @param {string} path the path to parse.
 * @returns {ParsedRoute} the parsed route.
 */
export function parseRoute(path) {
    let params = [];
    let regex = path.replace(/:([^\s\/]+):(number|string|boolean)/g, (e, k, v) => {
        params.push([k, v]);
        return TYPES_TO_REGEX[v];
    }).replace(/:([^\s\/]+)/g, (e, k) => {
        params.push([k, "string"]);
        return TYPES_TO_REGEX["string"];
    });
    return {
        regex,
        routeParams: params,
    };
}
export function createRouteDef(cfg) {
    cfg.route = cfg.route.replace(/[\/]{2,}/g, '/');
    let { route, renderStack, authenticate, props, isRedirect, isAuth, hasChildren } = cfg;
    let { regex, routeParams } = parseRoute(route);
    let params = {};
    let stack = renderStack.slice(0);
    let innerChild = stack.pop();
    let routeData = null;
    if (hasChildren) {
        regex += ".*";
    }
    let reg = new RegExp("^" + regex + "$", 'i');
    function debug() {
        console.log(reg, regex, stack);
    }
    function test(path) {
        reg.lastIndex = 0;
        let matches = path.match(reg);
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
        let $inject = component.$inject;
        props.routeParams = params;
        if (typeof $inject === "object" && $inject.length) {
            $inject.forEach((e) => {
                props[e] = dataStore.get(e);
            });
        }
    }
    function render(dataStore) {
        if (isRedirect) {
            return null;
        }
        let $inject;
        if (stack.length === 0) {
            inject(dataStore, innerChild[0], innerChild[1]);
            return React.createElement(innerChild[0], innerChild[1]);
        }
        else {
            inject(dataStore, innerChild[0], innerChild[1]);
            return stack.reduceRight((prev, current, a, b) => {
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
        debug,
        test,
        route,
        data,
        auth,
        onEnter: cfg.onEnter || (stack.length && stack[0] && stack[0].length && stack[0][0].onEnter),
        onLeave: cfg.onLeave || (stack.length && stack[0] && stack[0].length && stack[0][0].onEnter),
        props: _props,
        isRedirect,
        isAuth,
        render
    };
    return o;
}
/**
 * An implementation of the ES6 find method.
 * @param {T[]} array the array to loop through.
 * @param {IteratorCallback<T>} fn the iterator to call on every item in
 * the array up until the method returns a truthful value.
 */
export function find(array, fn) {
    let i = 0, l = array.length;
    for (; i < l; i++) {
        if (fn(array[i], i)) {
            return array[i];
        }
    }
    return null;
}
let countChildren = React.Children.count;
export function traverse(children, router, renderStack, parentPath = '') {
    let pathSep = router.PATH_SEP;
    return React.Children.map(children, (child, index) => {
        let hasChildren = countChildren(child.props.children) > 0, childPath = child.props.path;
        child.props.props.router = router;
        child.props.props.dataStore = router.getDataStore();
        renderStack.push([child.props.component, child.props.props]);
        if (hasChildren) {
            traverse(child.props.children, router, renderStack, [parentPath, childPath].join(pathSep));
        }
        let x = null;
        if (child.type === IndexRoute) {
            x = router.routeDefFromPath({
                route: parentPath + pathSep + '?',
                hasChildren: false,
                props: child.props,
                renderStack,
                isRedirect: false,
                isAuth: false,
                onEnter: child.props.onEnter,
                onLeave: child.props.onLeave
            });
        }
        else if (child.type === NotFoundRoute) {
            x = router.routeDefFromPath({
                route: [parentPath, ':route:any'].join(pathSep),
                hasChildren: false,
                props: child.props,
                renderStack,
                isRedirect: false,
                isAuth: false,
                onEnter: child.props.onEnter,
                onLeave: child.props.onLeave
            });
        }
        else if (child.type === Redirect && child.props.to && child.props.to.length > 0) {
            x = router.routeDefFromPath({
                route: [parentPath, childPath].join(pathSep),
                hasChildren: false,
                props: child.props,
                renderStack,
                isRedirect: true,
                isAuth: false,
                onEnter: child.props.onEnter,
                onLeave: child.props.onLeave
            });
        }
        else if (child.type === AuthRoute && child.props.auth) {
            x = router.routeDefFromPath({
                route: [parentPath, childPath].join(pathSep),
                hasChildren: hasChildren,
                props: child.props,
                renderStack,
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
                renderStack,
                isRedirect: false,
                isAuth: false
            });
        }
        renderStack.pop();
        return x;
    });
}
