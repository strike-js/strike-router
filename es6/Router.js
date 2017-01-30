import * as React from 'react';
import { traverse, parseRoute, createDataStore, find } from './Util';
export class Router extends React.Component {
    constructor(props) {
        super(props);
        this._doneSetup = false;
        this._routeDefs = [];
        this._pendingRedirect = null;
        this._routeIndices = {};
        this._activeRoute = null;
        this.PATH_SEP = props.pathSep || '/';
        this._routeData = props.dataStore || createDataStore();
        this.state = props.initialState || {
            currentRoute: props.initialRoute || props.history.currentRoute(),
        };
        props.history.setDelegate(this);
        traverse(props.children, this, [], props.rootPath || '');
    }
    setRouteData(data, atKey) {
        this._routeData.set(atKey ? [this.state.currentRoute, atKey].join(this.PATH_SEP) : this.state.currentRoute, data);
    }
    getRouteData(key) {
        return this._routeData.get(key ? [this.state.currentRoute, key].join(this.PATH_SEP) : this.state.currentRoute);
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
        this.setState({
            prevRoute,
            currentRoute: nextRoute
        });
    }
    getDataStore() {
        return this._routeData;
    }
    getRouteDef(path) {
        return this._routeDefs[this._routeIndices[path]];
    }
    routeDefFromPath(path, hasChildren, props, renderStack) {
        let temp = null;
        if (temp = this._routeIndices[path]) {
            return this._routeDefs[temp];
        }
        let route = parseRoute(path, hasChildren, props, renderStack);
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
        this._checkRedirect();
        if (this.props.onRouteChange) {
            if (prevState.currentRoute !== this.state.currentRoute) {
                this.props.onRouteChange(this._activeRoute, this._activeRoute.test(this.state.currentRoute));
            }
        }
    }
    componentDidMount() {
        this._checkRedirect();
        if (this.props.onRouteChange) {
            this.props.onRouteChange(this._activeRoute, this._activeRoute.test(this.state.currentRoute));
        }
    }
    render() {
        let currentRoute = this.state.currentRoute;
        let z = find(this._routeDefs, (e, i) => {
            return e.test(currentRoute) !== null;
        });
        if (z) {
            if (z.isRedirect()) {
                this._pendingRedirect = z;
                return null;
            }
            this._activeRoute = z;
            return z.render(this.getDataStore());
        }
        return null;
    }
}
