import * as React from 'react'; 
import {IRouter,Dictionary,DataStore,AuthCallback} from './Util';

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

/**
 * Basic properties of a route. 
 */
export interface BaseRouteProps {
    /**
     * The component to render when the route is active. 
     */
    component?:React.ComponentClass<any>; 
    /**
     * The props to use as the route's component props.
     * The router will also inject the a {DataStore} instance and 
     * the {IRouter} instance. 
     */
    props?:any; 
    /**
     * A method to call as an alternative to rendering the component itself. 
     * The method will be passed the props provided to the `props` property. 
     */
    render?:(props:any)=>React.ReactElement<any>; 
    /**
     * A callback to be called when the route is about to be rendered. 
     */
    onEnter?:(dataStore:DataStore,router:IRouter)=>void;
    /**
     * A callback to be called when the route is about to leave. 
     */
    onLeave?:(dataStore:DataStore,router:IRouter)=>void;
}

export interface RouteProps extends BaseRouteProps{
    children?:any;
    /**
     * The path of the route. 
     */
    path:string;
}

/**
 * Properties of the {AuthRoute} component. 
 */
export interface AuthRouteProps extends BaseRouteProps{
    /**
     * A callback to be called before entering the route. 
     * The callback is expected to call the {AuthCallback} callback when done. 
     * @param {IRouter} router the router managing this route. 
     * @param {DataStore} dataStore the data store used by the router. 
     * @param {AuthCallback} callback the callback to be called to either 
     * allow the user to enter the route, or be redirected to another. 
     */
    auth:(router:IRouter,dataStore:DataStore,callback:AuthCallback)=>void;
    /**
     * A redirection path.
     */
    redirectTo?:string;
    /**
     * The path of the authentication route. 
     */
    path:string;
}

export interface IndexRouteProps extends BaseRouteProps{

}

export interface NotFoundRouteProps extends BaseRouteProps{
    
}

export interface RouteState {

}

/**
 * 
 */
export interface RedirectRouteProps extends RouteProps{
    /**
     * whether to perform a hard reload or not. 
     */
    hard?:boolean; 
    /**
     * the redirect destination.
     */
    to:string;
    /**
     * the path to redirect.
     */
    path:string;
    
}

export interface AuthRouteState{

}

/**
 * A route that can be used to provide authentication mechanism. 
 */
export class AuthRoute extends React.Component<AuthRouteProps,AuthRouteState>{
    constructor(props) {
        super(props);
        this.state = {};
    }
    
    render() {
        return null;
    }
}

export class Route extends React.Component<RouteProps,RouteState> {
    constructor(props) {
        super(props);
        this.state = {};
    }
    
    render() {
        return null;
    }
}

export class IndexRoute extends React.Component<IndexRouteProps,RouteState> {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return null;
    }
}

export class NotFoundRoute extends React.Component<NotFoundRouteProps,RouteState> {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return null;
    }
}

export class Redirect extends React.Component<RedirectRouteProps,RouteState>{
    constructor(props){
        super(props);
        this.state = {}; 
    }

    render(){
        return null;
    }
}