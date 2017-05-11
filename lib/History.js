"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function memoryHistory(initialRoute) {
    var currentIndex = 0, guard = null, history = [initialRoute || '/'], enabled = true, delegate = null;
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
        //before making any change, check if there is a guard setup
        //on the route 
        if (guard) {
            //check if the guard is okay with us changing the route
            guard(routeAt(inc + currentIndex))
                .then(function (okay) {
                if (okay) {
                    doBackNext(inc);
                }
            }, function () {
                return false;
            });
            return;
        }
        doBackNext(inc);
    }
    function routeAt(index) {
        if (index >= 0 && index < history.length) {
            return history[index];
        }
        return null;
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
    function getCurrentRoute() {
        return history.length ? history[history.length - 1] : '';
    }
    function goTo(path) {
        if (guard) {
            guard(path)
                .then(function (okay) {
                if (okay) {
                    doGoTo(path);
                    return;
                }
            }, function () {
                return false;
            });
            return;
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
exports.memoryHistory = memoryHistory;
/**
 * Creates a history that tracks and manages hash changes.
 */
function hashHistory() {
    var currentIndex = 0, guard = null, history = [location.hash.substr(1)], enabled = true, delegate = null;
    window.addEventListener('hashchange', onHashChange);
    function acceptHashChange() {
        currentIndex++;
        var newHash = location.hash.substr(1);
        if (currentIndex < history.length) {
            history.splice(currentIndex);
        }
        history.push(newHash);
        onChange();
    }
    function onHashChange() {
        if (enabled) {
            acceptHashChange();
        }
        enabled = true;
    }
    function onChange() {
        delegate && delegate.onRouteChange(history[currentIndex], currentIndex > 0 ? history[currentIndex - 1] : null);
    }
    function setDelegate(del) {
        delegate = del;
        delegate && delegate.onRouteChange(history[currentIndex], currentIndex > 0 ? history[currentIndex - 1] : null);
    }
    function doBackNext(inc) {
        enabled = false;
        currentIndex += inc;
        if (location.hash.substr(1) === history[currentIndex]) {
            enabled = true;
        }
        location.hash = history[currentIndex];
    }
    function doGoTo(path) {
        enabled = false;
        if (path !== history[currentIndex]) {
            currentIndex++;
            history.splice(currentIndex);
            history.push(path);
        }
        if (location.hash.substr(1) === history[currentIndex]) {
            enabled = true;
        }
        location.hash = history[currentIndex];
    }
    function change(inc) {
        doBackNext(inc);
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
        doGoTo(path);
    }
    function routeAt(index) {
        if (index >= 0 && index < history.length) {
            return history[index];
        }
        return null;
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
/**
 * Creates a history that tracks and manages pop state history.
 */
function popStateHistory(root) {
    var enabled = true, currentIndex = 0, guard = null, hist = [getRoute(location.pathname)], delegate = null;
    window.addEventListener('popstate', onPopStateChange);
    function getRoute(path) {
        return path.replace(root, '') || '/';
    }
    function acceptRouteChange() {
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
    function onPopStateChange(event) {
        if (enabled) {
            if (guard) {
                guard(getRoute(location.pathname))
                    .then(function (okay) {
                    if (okay) {
                        acceptRouteChange();
                        onChange();
                        return;
                    }
                    enabled = false;
                    location.pathname = getRoute(location.pathname);
                }, function () {
                    enabled = false;
                    location.pathname = getRoute(location.pathname);
                });
                return;
            }
        }
        enabled = true;
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
        if (guard) {
            guard(routeAt(inc + currentIndex))
                .then(function (okay) {
                if (okay) {
                    doBackNext(inc);
                }
            }, function () {
                return false;
            });
            return;
        }
        doBackNext(inc);
    }
    function routeAt(index) {
        if (index >= 0 && index < history.length) {
            return history[index];
        }
        return null;
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
        if (guard) {
            guard(path).then(function (okay) {
                if (okay) {
                    doGoTo(path);
                }
            }, function () {
                return false;
            });
            return;
        }
        doGoTo(path);
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
