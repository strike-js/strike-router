import * as React from 'react'; 
import {IndexRoute,Route,NotFoundRoute} from './Route';
import {RouteHistory} from './History'; 
import {Dictionary,identity,
        RouteGuard,
        traverse,
        parseRoute,RouteDef,createDataStore,
        find,RouteHistoryDelegate,
        IRouter,DataStore} from './Util'; 


export interface RouterProps{
    initialState?:RouterState;
    initialRoute?:string;
    history:RouteHistory; 
    pathSep?:string;
    children:(router:Router)=>any;
    onRouteChange?(routeDef:RouteDef,params:Dictionary<any>):void;
}

export interface RouterState{
    currentRoute?:string; 
    prevRoute?:string; 
}

export class Router extends React.Component<RouterProps,RouterState> implements IRouter{
    _doneSetup:boolean = false;
    _routeData:DataStore;
    _routeDefs:RouteDef[] = [];
    _pendingRedirect:RouteDef = null;
    _routeIndices:Dictionary<number> = {};
    _activeRoute:RouteDef = null; 
    PATH_SEP:string;
    constructor(props) {
        super(props);
        this.PATH_SEP = props.pathSep || '/';
        this._routeData = createDataStore();
        this.state = props.initialState || {
          currentRoute:props.initialRoute || '',
        };
        traverse(props.children, this, [], props.rootPath || '');
    }

    setRouteData(data) {
        this._routeData.set(this.state.currentRoute, data);
    }

    getRouteData(){
        return this._routeData.get(this.state.currentRoute); 
    }

    getDataForRoute(route) {
        return this._routeData[route];
    }

    getCurrentRoute():string {
        return this.state.currentRoute;
    }

    getPrevRoute():string {
        return this.state.prevRoute;
    }

    onRouteChange(prevRoute, nextRoute) {
        this.setState({
            prevRoute,
            currentRoute: nextRoute
        });
    }

    getDataStore(){
        return this._routeData;
    }
   
    getRouteDef(path):RouteDef {
        return this._routeDefs[this._routeIndices[path]];
    }

    routeDefFromPath(path:string, hasChildren:boolean, props:any, renderStack:any[][]):RouteDef{
        let temp = null;
        if (temp = this._routeIndices[path]) {
            return this._routeDefs[temp];
        }
        let route = parseRoute(path, hasChildren, props, renderStack);
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
        this._checkRedirect();
        if (this.props.onRouteChange){
            if (prevState.currentRoute !== this.state.currentRoute){
                this.props.onRouteChange(this._activeRoute,this._activeRoute.test(this.state.currentRoute));
            }
        }

    }

    componentDidMount(){
        this._checkRedirect();
        if (this.props.onRouteChange){
            this.props.onRouteChange(this._activeRoute,this._activeRoute.test(this.state.currentRoute));
        }
    }

    render() {
        let currentRoute = this.state.currentRoute;
        let z = find(this._routeDefs,(e, i) => {
            return e.test(currentRoute) !== null;
        });
        if (z){
            if (z.isRedirect()){
                this._pendingRedirect = z; 
                return null;
            }
            this._activeRoute = z; 
            return z.render();
        }
        return null;
    }
}