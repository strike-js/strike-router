function response(history) {
    function redirect(to) {
        history.goTo(to);
    }
    function view(component, props, children) {
    }
    return {
        redirect,
        view
    };
}
function ReactExpress() {
    var routes = [];
    var activeRoute = null;
    var middlewares = [];
    function use(...args) {
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
        use,
        route,
    };
    return o;
}
