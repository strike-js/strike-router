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
        let v = guard && guard.check();
        if (typeof v === "object" && v && v.then) {
            v.then((okay) => {
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
            let v = guard.check();
            if (typeof v === "object" && v && v.then) {
                v.then((okay) => {
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
export function hashHistory() {
    let currentIndex = 0, guard = null, history = [location.hash.substr(1)], enabled = true, delegate = null;
    window.addEventListener('hashchange', onHashChange);
    function onHashChange() {
        if (enabled) {
            currentIndex++;
            let newHash = location.hash.substr(1);
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
        let v = guard && guard.check();
        if (typeof v === "object" && v && v.then) {
            v.then((okay) => {
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
            let v = guard.check();
            if (typeof v === "object" && v && v.then) {
                v.then((okay) => {
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
export function popStateHistory(root) {
    let enabled = true, currentIndex = 0, guard = null, hist = [getRoute(location.pathname)], delegate = null;
    window.addEventListener('popstate', onPopStateChange);
    function getRoute(path) {
        return path.replace(root, '') || '/';
    }
    function onPopStateChange(event) {
        if (enabled) {
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
        let v = guard && guard.check();
        if (v && typeof v === "object") {
            v.then((okay) => {
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
        let v = guard && guard.check(path);
        if (typeof v === "object" && v.then) {
            return v.then((okay) => {
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
