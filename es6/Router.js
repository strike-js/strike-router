import * as React from 'react';
import { createRouteDef, traverse, createDataStore, find } from './Util';
export class Router extends React.Component {
    constructor(props) {
        super(props);
        /**
         *
         */
        this._doneSetup = false;
        /**
         *
         */
        this._routeDefs = [];
        /**
         *
         */
        this._pendingRedirect = null;
        /**
         *
         */
        this._routeIndices = {};
        /**
         *
         */
        this._activeRoute = null;
        this.PATH_SEP = props.pathSep || '/';
        this._routeData = props.dataStore || createDataStore();
        this.state = props.initialState || {
            currentRoute: props.initialRoute || props.history.currentRoute(),
        };
        traverse(props.children, this, [], props.rootPath || '');
        if (this.state.currentRoute) {
            props.history.goTo(this.state.currentRoute);
        }
    }
    /**
     * Sets the data at a given key or at the current route.
     * @param {any} data the data to store.
     * @param {string} [atKey] the key to store the data at. If not
     * provided, the current route path will be used instead.
     */
    setRouteData(data, atKey) {
        this._routeData.set(atKey ? atKey : this.state.currentRoute, data);
    }
    /**
     * Returns the data at the current route or at a given key.
     * @param {string} [atKey] the key to get the data at.
     */
    getRouteData(atKey) {
        return this._routeData.get(atKey ? atKey : this.state.currentRoute);
    }
    /**
     * Get the current route.
     * @returns {string} the current route.
     */
    getCurrentRoute() {
        return this.state.currentRoute;
    }
    /**
     * Get the previous route.
     * @returns {string} the previous route.
     */
    getPrevRoute() {
        return this.state.prevRoute;
    }
    onRouteChange(currentRoute, prevRoute) {
        let history = this.props.history;
        let active = this._activeRoute;
        let dS = this._routeData;
        let params = null;
        let z = find(this._routeDefs, (e, i) => {
            return ((params = e.test(currentRoute)) !== null);
        });
        if (z && (currentRoute !== prevRoute)) {
            this._routeData.set('routeParams', params);
            active && active.onLeave && active.onLeave(dS, this);
            if (z.isRedirect) {
                this._activeRoute = z;
                z.onEnter && z.onEnter(dS, this);
                history.goTo(z.props('to'));
                return;
            }
            else if (z.isAuth) {
                //@todo implement alternative view
                z.auth(this, this._routeData, (okay, redirectTo, alternative) => {
                    if (okay) {
                        this._activeRoute = z;
                        z.onEnter && z.onEnter(dS, this);
                        this.setState({
                            prevRoute,
                            currentRoute
                        });
                        return;
                    }
                    let redirectRoute = (typeof redirectTo === "string" && redirectTo) || z.props("redirectTo");
                    if (redirectRoute) {
                        history.goTo(redirectTo);
                        return;
                    }
                    history.goTo(prevRoute);
                });
                return;
            }
            this._activeRoute = z;
            z.onEnter && z.onEnter(dS, this);
            this.setState({
                prevRoute,
                currentRoute
            });
        }
    }
    /**
     * Returns the data store of the router.
     * @returns {DataStore} the data store of the router.
     */
    getDataStore() {
        return this._routeData;
    }
    /**
     * Get route definition of a given path.
     * @returns {RouteDef} the route definition or {undefined} if not found.
     */
    getRouteDef(path) {
        return this._routeDefs[this._routeIndices[path]];
    }
    /**
     * Creates a RouteDef given a path configuration.
     * @param {RouteConfig} cfg the route configuration.
     * @returns {RouteDef}
     */
    routeDefFromPath(cfg) {
        let temp = null;
        let path = cfg.route;
        if (temp = this._routeIndices[path]) {
            return this._routeDefs[temp];
        }
        let route = createRouteDef(cfg);
        ;
        this._routeDefs.push(route);
        this._routeIndices[path] = this._routeDefs.length - 1;
        return (route);
    }
    /**
     * Sets a guard at the current route.
     * @param {RouteGuard} guard the guard to protect the current route.
     */
    setGuard(guard) {
        this.guard = guard;
        this.props.history.setGuard(guard);
    }
    _checkRedirect() {
        if (this._pendingRedirect) {
            let redirect = this._pendingRedirect;
            this._pendingRedirect = null;
            this.props.history.goTo(redirect.props('to'));
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if (this.props.onRouteChange) {
            if (prevState.currentRoute !== this.state.currentRoute) {
                this.props.onRouteChange(this._activeRoute, this._activeRoute.test(this.state.currentRoute));
            }
        }
    }
    componentDidMount() {
        // if (this.props.onRouteChange){
        //     this.props.onRouteChange(this._activeRoute,this._activeRoute.test(this.state.currentRoute));
        // }
        this.props.history.setDelegate(this);
    }
    render() {
        return this._activeRoute ? this._activeRoute.render(this.getDataStore()) : null;
    }
}
