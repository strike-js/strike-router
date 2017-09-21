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
    children?:any;
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
    guard:RouteGuard; 

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
    /**
     * The path separator to use.
     */
    PATH_SEP:string;
    constructor(props:RouterProps) {
        super(props);
        this.PATH_SEP = props.pathSep || '/';
        this._routeData = props.dataStore || createDataStore();
        this.state = props.initialState || {
          currentRoute:props.initialRoute || props.history.currentRoute(),
        };
        traverse(props.children, this, [], props.rootPath || '');
        
        if (this.state.currentRoute){
            props.history.goTo(this.state.currentRoute);
        }
    }

    /**
     * Sets the data at a given key or at the current route. 
     * @param {any} data the data to store. 
     * @param {string} [atKey] the key to store the data at. If not 
     * provided, the current route path will be used instead.
     */
    setRouteData(data:any,atKey?:string) {
        this._routeData.set(atKey?atKey:this.state.currentRoute, data);
    }

    /**
     * Returns the data at the current route or at a given key. 
     * @param {string} [atKey] the key to get the data at. 
     */
    getRouteData(atKey?:string){
        return this._routeData.get(atKey?atKey:this.state.currentRoute); 
    }

    /**
     * Get the current route. 
     * @returns {string} the current route. 
     */
    getCurrentRoute():string {
        return this.state.currentRoute;
    }

    /**
     * Get the previous route.
     * @returns {string} the previous route. 
     */
    getPrevRoute():string {
        return this.state.prevRoute;
    }

    _handleRouteChange(currentRoute:string,prevRoute:string):void{
        let history = this.props.history;
        let active = this._activeRoute;
        let dS = this._routeData; 
        let params = null; 
        let z = find(this._routeDefs,(e, i) => {
            return ((params = e.test(currentRoute)) !== null);
        });
        if (z && (currentRoute !== prevRoute)){
            this._routeData.set('routeParams',params);
            active && active.onLeave && active.onLeave(dS,this); 
            if (z.isRedirect){
                this._activeRoute = z; 
                z.onEnter && z.onEnter(dS,this);
                history.goTo(z.props('to'));
                return;
            }else if (z.isAuth){
                //@todo implement alternative view
                z.auth(this,this._routeData,(okay:boolean,redirectTo?:string,alternative?:any)=>{
                    if (okay){
                        this._activeRoute = z;
                        z.onEnter && z.onEnter(dS,this);  
                        this.setState({
                            prevRoute,
                            currentRoute
                        });    
                        return;
                    }
                    let redirectRoute = (typeof redirectTo === "string" && redirectTo )||z.props("redirectTo");
                    if (redirectRoute){
                        location.hash = redirectRoute; 
                        // history.goTo(redirectTo);
                        return; 
                    }
                    history.goTo(prevRoute);
                });
                return;
            }
            this._activeRoute = z; 
            z.onEnter && z.onEnter(dS,this);
            this.setState({
                prevRoute,
                currentRoute
            });
        }
    }

    onRouteChange(currentRoute:string,prevRoute:string):void{
        if (this.guard){
            this.guard(currentRoute).then((okay)=>{
                if (okay){
                    this.guard = null; 
                    this._handleRouteChange(currentRoute,prevRoute); 
                    return; 
                }
                this.props.history.back();
            },()=>{
                this.props.history.back();
            })
            return; 
        }
        this._handleRouteChange(currentRoute,prevRoute); 

    }

    /**
     * Returns the data store of the router. 
     * @returns {DataStore} the data store of the router.
     */
    getDataStore(){
        return this._routeData;
    }

    /**
     * Get route definition of a given path. 
     * @returns {RouteDef} the route definition or {undefined} if not found.
     */
    getRouteDef(path):RouteDef {
        return this._routeDefs[this._routeIndices[path]];
    }

    /**
     * Creates a RouteDef given a path configuration. 
     * @param {RouteConfig} cfg the route configuration.
     * @returns {RouteDef}
     */
    routeDefFromPath(cfg:RouteConfig):RouteDef{
        let temp = null;
        let path = cfg.route;
        if (typeof (temp = this._routeIndices[path]) !== "undefined") {
            return this._routeDefs[temp];
        }
        let route = createRouteDef(cfg);;
        this._routeDefs.push(route);
        this._routeIndices[path] = this._routeDefs.length - 1;
        return (route);
    }

    /**
     * Sets a guard at the current route. 
     * @param {RouteGuard} guard the guard to protect the current route. 
     */
    setGuard(guard:RouteGuard) {
        this.guard = guard; 
        // this.props.history.setGuard(guard);
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
        // if (this.props.onRouteChange){
        //     this.props.onRouteChange(this._activeRoute,this._activeRoute.test(this.state.currentRoute));
        // }
        this.props.history.setDelegate(this);
    }

    componentWillReceiveProps(nextProps:RouterProps){
        if (nextProps.children !== this.props.children){
            this._routeDefs = [];
            this._routeIndices = {}; 
            traverse(nextProps.children, this, [], nextProps.rootPath || '');
            this.setState({
                currentRoute:nextProps.history.currentRoute()
            });
        }
    }

    render() {
        return this._activeRoute?this._activeRoute.render(this.getDataStore()):null;
    }
}