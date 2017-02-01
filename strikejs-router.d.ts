declare module "strikejs-router"{
    import * as React from 'react'; 

    export interface Dictionary<T>{
        [idx:string]:T;
    }

    export function identity(v);

    export function getSet(obj:any):(...args:any[])=>any;

    export interface AuthCallback{
        (okay:boolean,redirectTo?:string,alternativeView?:any):void;
    }

    export interface RouteDef {
        test(path:string):Dictionary<any>|null;
        data(data:any);
        props(...props:any[]);
        isRedirect:boolean;
        isAuth:boolean;
        route:string;
        render(data?:any):any;
        auth:(router:IRouter,dataStore:DataStore,callback:AuthCallback)=>void;
        onEnter?:(dataStore:DataStore,router:IRouter)=>void;
        onLeave?:(dataStore:DataStore,router:IRouter)=>void;
    }

    export const TYPES_TO_PARSE:Dictionary<any>;


    export const TYPES_TO_REGEX;



    export function createDataStore():DataStore;

    export interface RouteConfig {
        route:string;
        hasChildren:boolean; 
        props:any;
        renderStack:any[][],
        isRedirect:boolean; 
        isAuth:boolean;
        authenticate?:(router:IRouter,dataStore:DataStore,callback:AuthCallback)=>void;
    }

    export interface ParsedRoute {
        routeParams:[string,string][]; 
        regex:string;
    }

    export function parseRoute(path:string):ParsedRoute;

    export function createRouteDef(cfg:RouteConfig):RouteDef;

    export function find<T>(array:T[],fn:(val:T,index:number)=>boolean):T|null;


    export interface RouteHistoryDelegate{
        onRouteChange(prevRoute:string,nextRoute:string):void; 
    }

    export interface DataStore{
        get(key:string):any;
        set(key:string,val:any):void;
    }

    export interface RouteDataStore{
        setRouteData(data:any,atKey?:string):void;
        getRouteData(atKey?:string):any;
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
        routeDefFromPath(cfg:RouteConfig):RouteDef;
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

    export function memoryHistory(initialRoute?:string):RouteHistory;

    export function hashHistory():RouteHistory;

    export function popStateHistory(root:string):RouteHistory;

    export interface RedirectFn{
        (to:string,hard?:boolean):void; 
    }

    export interface OkayFn{
        ():void;
    }

    export interface RenderFn{
        (el:React.ReactElement<any>):void; 
    }

    export interface NextFn{
        ():void;
    }

    export interface Constraint{
        (routeParams:Dictionary<any>, redirect:RedirectFn, okay:OkayFn, render:RenderFn, next:NextFn):void; 
    }

    export interface BaseRouteProps {
        constraints?:Constraint[];
        component?:React.ComponentClass<any>; 
        props?:any; 
        render?:(props:any)=>React.ReactElement<any>; 
        onEnter?:(dataStore:DataStore,router:IRouter)=>void; 
        onLeave?:(dataStore:DataStore,router:IRouter)=>void; 
    }

    export interface RouteProps extends BaseRouteProps{
        children?:any;
        path:string;
    }

    export interface AuthRouteProps extends BaseRouteProps{
        auth:(router:IRouter,dataStore:DataStore,callback:AuthCallback)=>void;
        path:string;
    }

    export interface IndexRouteProps extends BaseRouteProps{

    }

    export interface NotFoundRouteProps extends BaseRouteProps{
        
    }

    export interface RouteState {

    }

    export interface RedirectRouteProps extends RouteProps{
        hard?:boolean; 
        to:string;
    }

    export interface AuthRouteState{

    }

    export class AuthRoute extends React.Component<AuthRouteProps,AuthRouteState>{
        constructor(props);
    }

    export class Route extends React.Component<RouteProps,RouteState> {
        constructor(props);
    }

    export class IndexRoute extends React.Component<IndexRouteProps,RouteState> {
        constructor(props);
    }

    export class NotFoundRoute extends React.Component<NotFoundRouteProps,RouteState> {
        constructor(props);
    }

    export class Redirect extends React.Component<RedirectRouteProps,RouteState>{
        constructor(props);
    }

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
        /**
         * 
         */
        _doneSetup:boolean;
        /**
         * 
         */
        _routeData:DataStore;
        /**
         * 
         */
        _routeDefs:RouteDef[];
        /**
         * 
         */
        _pendingRedirect:RouteDef;
        /**
         * 
         */
        _routeIndices:Dictionary<number>;
        /**
         * 
         */
        _activeRoute:RouteDef;
        PATH_SEP:string;
        constructor(props:RouterProps);

        setRouteData(data:any,atKey?:string);

        getRouteData(atKey?:string);

        getDataForRoute(route:string);

        getCurrentRoute():string;

        getPrevRoute():string;

        onRouteChange(currentRoute:string, prevRoute:string);

        getDataStore();
    
        getRouteDef(path):RouteDef;

        routeDefFromPath(cfg:RouteConfig):RouteDef;

        setGuard(guard:RouteGuard);

        _checkRedirect();

        componentDidUpdate(prevProps:RouterProps,prevState:RouterState);

        componentDidMount();
    }
}