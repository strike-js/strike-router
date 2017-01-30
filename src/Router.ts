import * as React from 'react'; 
import {IndexRoute,Route,NotFoundRoute} from './Route';
import {RouteHistory} from './History'; 
import {Dictionary,identity,
        RouteGuard,
        traverse,
        parseRoute,RouteDef,createDataStore,
        find,RouteHistoryDelegate,
        IRouter,DataStore} from './Util'; 


export interface RouterComponentProps{
    actionType:string|number; 
    stateKey:string;
    initialState?:RouterComponentState;
    initialRoute?:string;
    history:RouteHistory; 
    pathSep?:string;
    children:(router:Router)=>any;
    onRouteChange?(routeDef:RouteDef,params:Dictionary<any>):void;
}

export interface RouterComponentState{
    currentRoute?:string; 
    prevRoute?:string; 
}

export class Router extends React.Component<RouterComponentProps,RouterComponentState> implements IRouter{
    _doneSetup:boolean = false;
    _routeData:DataStore;
    _routeDefs:RouteDef[] = [];
    _pendingRedirect:RouteDef = null;
    _routeIndices:Dictionary<number> = {};
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

    componentDidUpdate(){
        this._checkRedirect();
    }

    componentDidMount(){
        this._checkRedirect();
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
        }
        if (z && !z.isRedirect()) {
            return z.render();
        }
        return null;
    }
}