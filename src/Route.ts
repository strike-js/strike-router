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

export interface BaseRouteProps {
    constraints?:Constraint[];
    component?:React.ComponentClass<any>; 
    props?:any; 
    render?:(props:any)=>React.ReactElement<any>; 
}

export interface RouteProps extends BaseRouteProps{
    children?:any;
    path:string;
}

export interface AuthRouteProps extends BaseRouteProps{
    auth:(router:IRouter,dataStore:DataStore,callback:AuthCallback)=>void;
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