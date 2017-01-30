import * as React from 'react'; 
import {IndexRoute,NotFoundRoute,Redirect} from './Route'; 
export interface Dictionary<T>{
    [idx:string]:T;
}

export function identity(v){
    return v;
}


export interface RouteDef {
    test(path:string):Dictionary<any>|null;
    data(data:any);
    props(...props:any[]);
    isRedirect():boolean;
    render():any;
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



export function createDataStore(){
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

export function parseRoute(route:string, hasChildren:boolean, elemProps:any, renderStack:any[][], isRedirect:boolean = false):RouteDef{
    let routeParams = [];
    let stack = renderStack.slice(0);
    let routeData = null;
    let r = route.replace(/:([^\s\/]+):(number|string|boolean)/g, (e, k, v) => {
        routeParams.push([k, v]);
        return TYPES_TO_REGEX[v];
    }).replace(/:([^\s\/]+)/g, (e, k) => {
        routeParams.push([k, "string"]);
        return TYPES_TO_REGEX["string"];
    });
    if (hasChildren) {
        r += ".*";
    }

    function debug(){
        console.log(reg,r,stack);
    }

    function test(path) {
        reg.lastIndex = 0;
        let matches = path.match(reg);
        if (matches && matches.length) {
            return getParamsFromMatches(routeParams, matches, route, path);
        }
        return null;
    }

    function data(data) {
        if (arguments.length === 0) {
            return routeData;
        }
        routeData = data;
    }

    function props(key:string) {
        return elemProps[key]; 
    }

    function _isRedirect(){
        return isRedirect;
    }

    function render(){
        if (isRedirect){
            return null;
        }
        if (stack.length === 1){
            return React.createElement(stack[0][0],stack[0][1]);
        }else {
            return (stack as any).reduceRight((prev:any,current:any,a,b)=>{
            return (React.createElement(current[0], current[1], 
                            prev.length?React.createElement(prev[0],prev[1]):prev));
            });
        }
    }

    let reg = new RegExp("^" + r + "$", 'i');
    var o = {
        debug,
        test,
        data,
        props,
        isRedirect:_isRedirect,
        render
    };
    return o;
}

export function find<T>(array:T[],fn:(val:T,index:number)=>boolean){
    let i = 0,
        l = array.length; 
    for(;i<l;i++){
        if (fn(array[i],i)){
            return array[i]; 
        }
    }
    return null;
}


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
    routeDefFromPath(path:string, hasChildren:boolean, props:any, renderStack:any[][],isRedirect?:boolean):RouteDef;
    PATH_SEP:string;

}

let countChildren = React.Children.count;
export function traverse(children:React.ReactChild, router:IRouter, renderStack:any[][], parentPath = '/') {
    let pathSep = router.PATH_SEP;
    return React.Children.map(children, (child:any, index:number) => {
        let hasChildren = countChildren(child.props.children) > 0,
            childPath = child.props.path;
        child.props.props.router = router;
        renderStack.push([child.props.component,child.props.props]);
        
        if (hasChildren) {
            traverse(child.props.children, router, renderStack, [parentPath, childPath].join(pathSep));
        }
        let x = null; 
        if (child.type === IndexRoute) {
            x = router.routeDefFromPath([parentPath,''].join(pathSep), false, child.props, renderStack);
        } else if (child.type === NotFoundRoute) {
            x = router.routeDefFromPath([parentPath, ':route:any'].join(pathSep), false, child.props, renderStack);
        } else if (child.type === Redirect && child.props.to && child.props.to.length > 0){
            x = router.routeDefFromPath([parentPath,childPath].join(pathSep), false, child.props, renderStack,true);
        } else {
            x = router.routeDefFromPath([parentPath,childPath].join(pathSep), false, child.props, renderStack);  
        }
        renderStack.pop();
        return x;
    });
}
