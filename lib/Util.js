"use strict";
var React = require("react");
var Route_1 = require("./Route");
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
