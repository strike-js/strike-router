import * as React from 'react';
import { IndexRoute, NotFoundRoute, Redirect } from './Route';
export function identity(v) {
    return v;
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
export function parseRoute(route, hasChildren, elemProps, renderStack, isRedirect = false) {
    let routeParams = [];
    let params = {};
    let stack = renderStack.slice(0);
    let innerChild = stack.pop();
    let routeData = null;
    let r = route.replace(/:([^\s\/]+):(number|string|boolean)/g, (e, k, v) => {
        routeParams.push([k, v]);
        return TYPES_TO_REGEX[v];
    }).replace(/:([^\s\/]+)/g, (e, k) => {
        routeParams.push([k, "string"]);
        return TYPES_TO_REGEX["string"];
    });
    if (hasChildren) {
        r += ".*";
    }
    function debug() {
        console.log(reg, r, stack);
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
    function props(key) {
        return elemProps[key];
    }
    function _isRedirect() {
        return isRedirect;
    }
    function inject(dataStore, component, props) {
        let $inject = component.$inject;
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
            innerChild[1].routeParams = params;
            return React.createElement(innerChild[0], innerChild[1]);
        }
        else {
            inject(dataStore, innerChild[0], innerChild[1]);
            return stack.reduceRight((prev, current, a, b) => {
                if (prev && prev.length) {
                    inject(dataStore, prev[0], prev[1]);
                    prev[1].routeParams = params;
                }
                current[1].routeParams = params;
                inject(dataStore, current[0], current[1]);
                return (React.createElement(current[0], current[1], prev));
            }, React.createElement(innerChild[0], innerChild[1]));
        }
    }
    let reg = new RegExp("^" + r + "$", 'i');
    var o = {
        debug,
        test,
        data,
        props,
        isRedirect: _isRedirect,
        render
    };
    return o;
}
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
            x = router.routeDefFromPath(parentPath + pathSep + '?', false, child.props, renderStack);
        }
        else if (child.type === NotFoundRoute) {
            x = router.routeDefFromPath([parentPath, ':route:any'].join(pathSep), false, child.props, renderStack);
        }
        else if (child.type === Redirect && child.props.to && child.props.to.length > 0) {
            x = router.routeDefFromPath([parentPath, childPath].join(pathSep), false, child.props, renderStack, true);
        }
        else {
            x = router.routeDefFromPath([parentPath, childPath].join(pathSep), false, child.props, renderStack);
        }
        renderStack.pop();
        return x;
    });
}
