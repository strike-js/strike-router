export function memoryHistory(initialRoute) {
    let currentIndex = 0, guard = null, history = [initialRoute || '/'], enabled = true, delegate = null;
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
                .then((okay) => {
                if (okay) {
                    doBackNext(inc);
                }
            }, () => {
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
                .then((okay) => {
                if (okay) {
                    doGoTo(path);
                    return;
                }
            }, () => {
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
        setDelegate,
        currentRoute,
        prevRoute,
        history,
        back,
        next,
        goTo,
        setGuard,
    };
}
/**
 * Creates a history that tracks and manages hash changes.
 */
export function hashHistory() {
    let currentIndex = 0, guard = null, history = [location.hash.substr(1)], enabled = true, delegate = null;
    window.addEventListener('hashchange', onHashChange);
    function acceptHashChange() {
        currentIndex++;
        let newHash = location.hash.substr(1);
        if (currentIndex < history.length) {
            history.splice(currentIndex);
        }
        history.push(newHash);
    }
    function onHashChange() {
        if (enabled) {
            if (guard) {
                guard(location.hash.slice(1))
                    .then((okay) => {
                    if (okay) {
                        acceptHashChange();
                        onChange();
                        return;
                    }
                    enabled = false;
                    location.hash = currentRoute();
                }, () => {
                    enabled = false;
                    location.hash = currentRoute();
                });
                return;
            }
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
        if (guard) {
            guard(routeAt(currentIndex + inc))
                .then((okay) => {
                if (okay) {
                    doBackNext(inc);
                }
            }, () => {
                return false;
            });
            return;
        }
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
        if (guard) {
            guard(path).then((okay) => {
                if (okay) {
                    doGoTo(path);
                }
            }, () => {
                return false;
            });
            return;
        }
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
        setDelegate,
        currentRoute,
        prevRoute,
        history,
        back,
        next,
        goTo,
        setGuard,
    };
}
/**
 * Creates a history that tracks and manages pop state history.
 */
export function popStateHistory(root) {
    let enabled = true, currentIndex = 0, guard = null, hist = [getRoute(location.pathname)], delegate = null;
    window.addEventListener('popstate', onPopStateChange);
    function getRoute(path) {
        return path.replace(root, '') || '/';
    }
    function acceptRouteChange() {
        currentIndex++;
        let newHash = getRoute(location.pathname);
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
                    .then((okay) => {
                    if (okay) {
                        acceptRouteChange();
                        onChange();
                        return;
                    }
                    enabled = false;
                    location.pathname = getRoute(location.pathname);
                }, () => {
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
                .then((okay) => {
                if (okay) {
                    doBackNext(inc);
                }
            }, () => {
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
            guard(path).then((okay) => {
                if (okay) {
                    doGoTo(path);
                }
            }, () => {
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
        setDelegate,
        currentRoute,
        prevRoute,
        history: [],
        setGuard,
        back,
        next,
        goTo,
    };
}
