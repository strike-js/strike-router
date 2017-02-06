import * as React from 'react'; 
import {IndexRoute,NotFoundRoute,Redirect,AuthRoute} from './Route'; 

/**
 * A generic dictionary interface.
 */
export interface Dictionary<T>{
    [idx:string]:T;
}


/**
 * An identity function i.e. returns whatever it receives in its first paramters. 
 */
export function identity(v){
    return v;
}

/**
 * A getter setter generator. 
 * Given an object, it returns a function that can be used to get 
 * or set properties of the object. 
 */
export function getSet(obj:any){
    return function(...args:any[]){
        if (args.length === 0){
            return obj; 
        }else if (args.length === 1){
            if (typeof args[0] === "string"){
                return obj[args[0]]; 
            }else if (typeof args[0] === "object" && 
                !(args[0] instanceof Array)){
                obj = {...obj,...args[0]};
            }else if (typeof args[0] === "object" &&
                args[0] instanceof Array){
                return args[0].map((e)=>{
                    return obj[e]; 
                });
            }
        }else if (args.length === 2){
            obj[args[0]] = args[1]; 
            return 
        }
    }
}

/**
 * A callback to be called in auth route. 
 */
export interface AuthCallback{
    (okay:boolean,redirectTo?:string,alternativeView?:any):void;
}

/**
 * Represents a compiled route in the application. 
 */
export interface RouteDef {
    /**
     * Tests whether a given path is part of the application. 
     */
    test(path:string):Dictionary<any>|null;
    /**
     * Sets the data of 
     */
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

export const TYPES_TO_PARSE:Dictionary<any> = {
    "number":parseFloat,
    "string":identity,
    "boolean":(v:string)=>{
        if (v.toLowerCase() === "true"){
            return true
        }
        return false;
    }
}


export const TYPES_TO_REGEX = {
    "number": '([0-9\.]+)',
    "string": '([^\\s\\/]+)',
    "any": '([\\s\\S]+)',
    "boolean": '(true|false|TRUE|FALSE)',
    "alphanumeric": '([a-zA-Z0-9]+)',
};

/**
 * Creates a simple local {@link DataStore}.
 */
export function createDataStore():DataStore{
    var data:Dictionary<any> = {}; 
    function get(key:string){
        return data[key]; 
    }

    function set(key:string,val:any){
        data[key] = val; 
    }

    return {
        get,
        set
    }; 
}

export function getParamsFromMatches(params:string[][],matches:string[],route:string,path:string){
    let i =0,
        data:Dictionary<any> = {
            route,
            path
        },
        l = params.length; 
    if (matches && matches.length){
        for (;i<l;i++){
            data[params[i][0]] = TYPES_TO_PARSE[params[i][1]](matches[i+1]); 
        }
    }
    return data; 
}

/**
 * Route configuration.
 */
export interface RouteConfig {
    /**
     * The route.
     */
    route:string;
    /**
     * Whether the route has children or not. 
     */
    hasChildren:boolean; 
    /**
     * The props passed to the route. 
     */
    props:any;
    /**
     * The render stack at this given route. 
     */
    renderStack:any[][];
    /**
     * Whether the route is a redirect route. 
     */
    isRedirect:boolean; 
    /**
     * Whether the route is an auth route.
     */
    isAuth:boolean;
    /**
     * An authentication callback to be called by the router to check if the 
     * user is allowed to access the route. 
     */
    authenticate?:(router:IRouter,dataStore:DataStore,callback:AuthCallback)=>void;
    /**
     * A callback to be called when the route is about to be renderd.
     */
    onEnter?:(dataStore:DataStore,router:IRouter)=>void;
    /**
     * A callback to be called when the route is about to leave. 
     */
    onLeave?:(dataStore:DataStore,router:IRouter)=>void;
}

export interface ParsedRoute {
    routeParams:[string,string][]; 
    regex:string;
}

/**
 * Parases a route with path parameters.
 * @param {string} path the path to parse.
 * @returns {ParsedRoute} the parsed route. 
 */
export function parseRoute(path:string):ParsedRoute{
    let params:[string,string][] = []; 
    let regex = path.replace(/:([^\s\/]+):(number|string|boolean)/g, (e, k, v) => {
        params.push([k, v]);
        return TYPES_TO_REGEX[v];
    }).replace(/:([^\s\/]+)/g, (e, k) => {
        params.push([k, "string"]);
        return TYPES_TO_REGEX["string"];
    });
    
    return {
        regex,
        routeParams:params,
    };
}

export function createRouteDef(cfg:RouteConfig):RouteDef{
    cfg.route = cfg.route.replace(/[\/]{2,}/g,'/');
    let {route,renderStack,authenticate,props,isRedirect,isAuth,hasChildren} = cfg; 
    let {regex,routeParams} = parseRoute(route); 
    let params = {};
    let stack = renderStack.slice(0);
    let innerChild = stack.pop();
    let routeData = null;
    if (hasChildren) {
        regex += ".*";
    }
    let reg = new RegExp("^" + regex + "$", 'i');

    function debug(){
        console.log(reg,regex,stack);
    }

    function test(path) {
        reg.lastIndex = 0;
        let matches = path.match(reg);
        if (matches && matches.length) {
            return (params = getParamsFromMatches(routeParams, matches, route, path));
        }
        return null;
    }

    function data(data) {
        if (arguments.length === 0) {
            return routeData;
        }
        routeData = data;
    }

    function _props(key:string) {
        return props[key]; 
    }

    function inject(dataStore:DataStore,component:any,props:any){
        let $inject:string[] = component.$inject; 
        props.routeParams = params;
        if (typeof $inject === "object" && $inject.length){
            $inject.forEach((e)=>{
                props[e] = dataStore.get(e);
            });
        }
    }

    function render(dataStore:DataStore){
        if (isRedirect){
            return null;
        }
        let $inject:string[]; 
        if (stack.length === 0){
            inject(dataStore,innerChild[0],innerChild[1]);
            return React.createElement(innerChild[0],innerChild[1]);
        } else {
            inject(dataStore,innerChild[0],innerChild[1]);
            return (stack as any).reduceRight((prev:any,current:any,a,b)=>{
                inject(dataStore,current[0],current[1]);
                return (React.createElement(current[0], current[1],prev));
            },React.createElement(innerChild[0],innerChild[1]));
        }
    }

    function auth(router:IRouter,dataStore:DataStore,callback:AuthCallback){
        if (isAuth){
            if (authenticate){
                authenticate(router,dataStore,callback);
                return; 
            }
            callback(true);
        }
        callback(true);
    }
    
    var o = {
        debug,
        test,
        route,
        data,
        auth,
        onEnter:cfg.onEnter || (stack.length && stack[0] && stack[0].length && stack[0][0].onEnter),
        onLeave:cfg.onLeave || (stack.length && stack[0] && stack[0].length && stack[0][0].onEnter),
        props:_props,
        isRedirect,
        isAuth,
        render
    };
    return o;
}

/**
 * An iterator callback.
 */
export interface IteratorCallback<T>{
    (val:T,index:number):boolean; 
}

/**
 * An implementation of the ES6 find method. 
 * @param {T[]} array the array to loop through. 
 * @param {IteratorCallback<T>} fn the iterator to call on every item in 
 * the array up until the method returns a truthful value.
 */
export function find<T>(array:T[],fn:(val:T,index:number)=>boolean):T|null{
    let i = 0,
        l = array.length; 
    for(;i<l;i++){
        if (fn(array[i],i)){
            return array[i]; 
        }
    }
    return null;
}

/**
 * An interface for a delegate that can listen to route changes. 
 */
export interface RouteHistoryDelegate{
    onRouteChange(currentRoute:string,prevRoute:string):void; 
}

/**
 * An interface for a {@link DataStore}.
 */
export interface DataStore{
    /**
     * Returns data stored at a given path.
     * @param {string} key the key to get the data at. 
     * @returns {any} the data at the given key.
     */
    get(key:string):any;
    /**
     * Sets data at a given path. 
     * @param {string} key the key to set the data at.
     * @param {any} val the data to store.
     */
    set(key:string,val:any):void;
}

/**
 * A data store to be used by an {@link IRouter}.
 */
export interface RouteDataStore{
    setRouteData(data:any,atKey?:string):void;
    getRouteData(atKey?:string):any;
}

/**
 * A route guard callback, this callback will be queried by the {@link IRouter}
 * instance to check whether the current route can be changed or not. 
 */
export interface RouteGuard {
    check(path?:string):boolean|Promise<boolean>;
}

/**
 * An interface implemented by the {@link Router}.
 */
export interface IRouter extends RouteDataStore{
    /**
     * Returns the current route. 
     */
    getCurrentRoute():string;
    /**
     * Returns the previous route. 
     */
    getPrevRoute():string;
    /**
     * Get the {@link RouteDef} of the current route. 
     */
    getRouteDef(path:string):RouteDef; 
    /**
     * Get the {@link DataStore} of the router.
     */
    getDataStore():DataStore;
    /**
     * Sets a {@link RouteGuard} on the current route. 
     * @param {RouteGuard} guard the guard to use. 
     */
    setGuard(guard:RouteGuard);
    /**
     * Creates a route definition given a {@link RouteConfig}.
     * @returns {RouteDef}
     */
    routeDefFromPath(cfg:RouteConfig):RouteDef;
    PATH_SEP:string;
}

let countChildren = React.Children.count;
export function traverse(children:React.ReactChild, router:IRouter, renderStack:any[][], parentPath = '') {
    let pathSep = router.PATH_SEP;
    return React.Children.map(children, (child:any, index:number) => {
        let hasChildren = countChildren(child.props.children) > 0,
            childPath = child.props.path;
        child.props.props.router = router;
        child.props.props.dataStore = router.getDataStore();
        renderStack.push([child.props.component,child.props.props]);
        
        if (hasChildren) {
            traverse(child.props.children, router, renderStack, [parentPath, childPath].join(pathSep));
        }
        let x = null; 
        if (child.type === IndexRoute) {
            x = router.routeDefFromPath({
                route:parentPath+pathSep+'?', 
                hasChildren:false,
                props:child.props,
                renderStack,
                isRedirect:false,
                isAuth:false,
                onEnter:child.props.onEnter,
                onLeave:child.props.onLeave
            });
        } else if (child.type === NotFoundRoute) {
            x = router.routeDefFromPath({
                route:[parentPath, ':route:any'].join(pathSep),
                hasChildren:false,
                props:child.props,
                renderStack,
                isRedirect:false,
                isAuth:false,
                onEnter:child.props.onEnter,
                onLeave:child.props.onLeave
            });
        } else if (child.type === Redirect && child.props.to && child.props.to.length > 0){
            x = router.routeDefFromPath({
                route:[parentPath,childPath].join(pathSep),
                hasChildren:false,
                props:child.props,
                renderStack,
                isRedirect:true,
                isAuth:false,
                onEnter:child.props.onEnter,
                onLeave:child.props.onLeave
            });
        } else if (child.type === AuthRoute && child.props.auth){
            x = router.routeDefFromPath({
                route:[parentPath,childPath].join(pathSep),
                hasChildren:hasChildren,
                props:child.props,
                renderStack,
                isRedirect:false,
                isAuth:true,
                authenticate:child.props.auth,
                onEnter:child.props.onEnter,
                onLeave:child.props.onLeave
            });
        } else {
            x = router.routeDefFromPath({
                route:[parentPath,childPath].join(pathSep), 
                hasChildren:hasChildren, 
                props:child.props, 
                renderStack,
                isRedirect:false,
                isAuth:false});  
        }
        renderStack.pop();
        return x;
    });
}
