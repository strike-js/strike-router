declare module "strikejs-router"{
    import * as React from 'react'; 
    export interface Dictionary<T>{
        [idx:string]:T;
    }

    export function identity(v:any):any;


    export interface RouteDef {
        test(path:string):Dictionary<any>|null;
        data(data:any);
        props(...props:any[]);
        isRedirect():boolean;
        render():any;
    }

    export function createDataStore():DataStore;
    export function find<T>(array:T[],fn:(val:T,index:number)=>boolean);


    export interface RouteHistoryDelegate{
        onRouteChange(prevRoute:string,nextRoute:string):void; 
    }

    export interface DataStore{
        get(key:string):any;
        set(key:string,val:any):void;
    }

    export interface RouteDataStore{
        setRouteData(data:any):void;
        getRouteData():any;
    }

    export interface RouteGuard {
        check(path?:string):boolean|Promise<boolean>;
    }

    export interface IRouter extends RouteDataStore{
        getCurrentRoute():string;
        getPrevRoute():string;
        getRouteDef(path:string):RouteDef; 
        getDataStore():DataStore;
        setGuard(guard:RouteGuard);
        routeDefFromPath(path:string, hasChildren:boolean, props:any, renderStack:any[][],isRedirect?:boolean):RouteDef;
        PATH_SEP:string;

    }

    export interface RouteHistory {
        history:string[]; 
        back();
        next(); 
        prevRoute():string;
        currentRoute():string;
        goTo(newRoute:string);
        setGuard(guard:RouteGuard):void;
        setDelegate(delegate:RouteHistoryDelegate); 
    }

    export interface RouteProps{
        path:string;
        component?:React.ComponentClass<any>; 
        props?:any; 
        render?:(props:any)=>React.ReactElement<any>; 
        children:any;
        router:IRouter; 
    }

    export interface RouteState {

    }

    interface RedirectRouteProps extends RouteProps{
        hard?:boolean; 
        to:string;
    }

    export class Route extends React.Component<RouteProps,RouteState> {
        constructor(props);
    }

    export class IndexRoute extends React.Component<RouteProps,RouteState> {
        constructor(props) ;
    }
    export class NotFoundRoute extends React.Component<RouteProps,RouteState> {
        constructor(props);
    }

    export class Redirect extends React.Component<RedirectRouteProps,RouteState>{
        constructor(props);
    }

    export function hashHistory():RouteHistory;
    export function popStateHistory(root:string):RouteHistory;

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
        _doneSetup:boolean;
        _routeData:DataStore;
        _routeDefs:RouteDef[];
        _pendingRedirect:RouteDef;
        _routeIndices:Dictionary<number>;
        PATH_SEP:string;
        constructor(props);

        setRouteData(data);

        getRouteData();

        getDataForRoute(route);

        getCurrentRoute():string;

        getPrevRoute():string;

        onRouteChange(prevRoute, nextRoute);

        getDataStore();
    
        getRouteDef(path):RouteDef;

        routeDefFromPath(path:string, hasChildren:boolean, props:any, renderStack:any[][]):RouteDef;

        setGuard(guard:RouteGuard);

    }
}