import * as React from 'react'; 
import {IndexRoute,Route,NotFoundRoute} from './Route';
import {RouteHistory} from './History'; 
import {Dictionary,identity,
        RouteGuard,
        createRouteDef,
        traverse,
        parseRoute,RouteDef,createDataStore,
        find,RouteHistoryDelegate,
        IRouter,DataStore,RouteConfig} from './Util'; 


export interface RouterProps{
    /**
     * The initial state of the {Router} this is useful to set the initial route of the router 
     */
    initialState?:RouterState;
    /**
     * The initial route to go to (otherwise the currentRoute will be set to whatever the history object is at). 
     */
    initialRoute?:string;
    /**
     * The underlying history manager. 
     */
    history:RouteHistory; 
    /**
     * The path separator to use, defaults '/' 
     */
    pathSep?:string;
    /**
     * The root path to resolve all paths to. 
     */
    rootPath?:string;
    /**
     * A data store to store data from routes, this can also be used to pass data 
     * from one route to another. 
     */
    dataStore?:DataStore;
    children:any;
    /**
     * A callback to be called everytime the route changes. 
     * Useful for integration with Redux and StrikeJS applications. 
     */
    onRouteChange?(routeDef:RouteDef,params:Dictionary<any>):void;
}

/**
 * @name RouterState
 * @description The Router State interface to provide static typing for Router's state. 
 */
export interface RouterState{
    /**
     * The current route 
     */
    currentRoute?:string;
    /**
     * The previous route. 
     */
    prevRoute?:string; 
}

export class Router extends React.Component<RouterProps,RouterState> implements IRouter{
    /**
     * 
     */
    _doneSetup:boolean = false;
    /**
     * 
     */
    _routeData:DataStore;
    /**
     * 
     */
    _routeDefs:RouteDef[] = [];
    /**
     * 
     */
    _pendingRedirect:RouteDef = null;
    /**
     * 
     */
    _routeIndices:Dictionary<number> = {};
    /**
     * 
     */
    _activeRoute:RouteDef = null; 
    PATH_SEP:string;
    constructor(props:RouterProps) {
        super(props);
        this.PATH_SEP = props.pathSep || '/';
        this._routeData = props.dataStore || createDataStore();
        this.state = props.initialState || {
          currentRoute:props.initialRoute || props.history.currentRoute(),
        };
        props.history.setDelegate(this);
        traverse(props.children, this, [], props.rootPath || '');
        if (this.state.currentRoute){
            props.history.goTo(this.state.currentRoute);
        }
    }

    setRouteData(data:any,atKey?:string) {
        this._routeData.set(atKey?atKey:this.state.currentRoute, data);
    }

    getRouteData(atKey?:string){
        return this._routeData.get(atKey?atKey:this.state.currentRoute); 
    }

    getDataForRoute(route:string) {
        return this._routeData.get(route);
    }

    getCurrentRoute():string {
        return this.state.currentRoute;
    }

    getPrevRoute():string {
        return this.state.prevRoute;
    }

    onRouteChange(nextRoute, prevRoute) {
        let currentRoute = this.state.currentRoute;
        let history = this.props.history;
        let z = find(this._routeDefs,(e, i) => {
            return e.test(currentRoute) !== null;
        });
        if (z){
            if (z.isRedirect){
                history.goTo(z.props('to'));
                return;
            }else if (z.isAuth){
                //@todo implement alternative view
                z.auth(this,this._routeData,function(okay:boolean,redirectTo?:string,alternative?:any){
                    if (okay){
                        this._activeRoute = z; 
                        this.setState({
                            prevRoute,
                            currentRoute: nextRoute
                        });    
                        return;
                    }
                    if (redirectTo && typeof redirectTo === "string"){
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

    getDataStore(){
        return this._routeData;
    }
   
    getRouteDef(path):RouteDef {
        return this._routeDefs[this._routeIndices[path]];
    }

    routeDefFromPath(cfg:RouteConfig):RouteDef{
        let temp = null;
        let path = cfg.route;
        if (temp = this._routeIndices[path]) {
            return this._routeDefs[temp];
        }
        let route = createRouteDef(cfg);;
        this._routeDefs.push(route);
        this._routeIndices[path] = this._routeDefs.length - 1;
        return (route);
    }

    setGuard(guard:RouteGuard) {
        this.props.history.setGuard(guard);
    }

    _checkRedirect(){
        if (this._pendingRedirect){
            let redirect = this._pendingRedirect; 
            this._pendingRedirect = null;
            this.props.history.goTo(redirect.props('to'));
        }
    }

    componentDidUpdate(prevProps:RouterProps,prevState:RouterState){
        if (this.props.onRouteChange){
            if (prevState.currentRoute !== this.state.currentRoute){
                this.props.onRouteChange(this._activeRoute,this._activeRoute.test(this.state.currentRoute));
            }
        }

    }

    componentDidMount(){
        if (this.props.onRouteChange){
            this.props.onRouteChange(this._activeRoute,this._activeRoute.test(this.state.currentRoute));
        }
    }

    render() {
        return this._activeRoute?this._activeRoute.render(this.getDataStore()):null;
    }
}