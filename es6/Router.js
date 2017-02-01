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
        props.history.setDelegate(this);
        traverse(props.children, this, [], props.rootPath || '');
        if (this.state.currentRoute) {
            props.history.goTo(this.state.currentRoute);
        }
    }
    setRouteData(data, atKey) {
        this._routeData.set(atKey ? atKey : this.state.currentRoute, data);
    }
    getRouteData(atKey) {
        return this._routeData.get(atKey ? atKey : this.state.currentRoute);
    }
    getDataForRoute(route) {
        return this._routeData.get(route);
    }
    getCurrentRoute() {
        return this.state.currentRoute;
    }
    getPrevRoute() {
        return this.state.prevRoute;
    }
    onRouteChange(nextRoute, prevRoute) {
        let currentRoute = this.state.currentRoute;
        let history = this.props.history;
        let z = find(this._routeDefs, (e, i) => {
            return e.test(currentRoute) !== null;
        });
        if (z) {
            if (z.isRedirect) {
                history.goTo(z.props('to'));
                return;
            }
            else if (z.isAuth) {
                //@todo implement alternative view
                z.auth(this, this._routeData, function (okay, redirectTo, alternative) {
                    if (okay) {
                        this._activeRoute = z;
                        this.setState({
                            prevRoute,
                            currentRoute: nextRoute
                        });
                        return;
                    }
                    if (redirectTo && typeof redirectTo === "string") {
                        history.goTo(redirectTo);
                        return;
                    }
                    history.goTo(prevRoute);
                });
                return;
            }
            this._activeRoute = z;
            this.setState({
                prevRoute,
                currentRoute: nextRoute
            });
        }
    }
    getDataStore() {
        return this._routeData;
    }
    getRouteDef(path) {
        return this._routeDefs[this._routeIndices[path]];
    }
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
    setGuard(guard) {
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
        if (this.props.onRouteChange) {
            this.props.onRouteChange(this._activeRoute, this._activeRoute.test(this.state.currentRoute));
        }
    }
    render() {
        return this._activeRoute ? this._activeRoute.render(this.getDataStore()) : null;
    }
}
