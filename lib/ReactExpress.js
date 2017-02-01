"use strict";
function response(history) {
    function redirect(to) {
        history.goTo(to);
    }
    function view(component, props, children) {
    }
    return {
        redirect: redirect,
        view: view
    };
}
function ReactExpress() {
    var routes = [];
    var activeRoute = null;
    var middlewares = [];
    function use() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (args.length === 1 &&
            typeof args[0] === "function") {
            middlewares.push(args[0]);
            return o;
        }
        else if (args.length === 2 &&
            typeof args[0] === "string" &&
            typeof args[1] === "function") {
        }
    }
    function route() {
    }
    var o = {
        use: use,
        route: route,
    };
    return o;
}
