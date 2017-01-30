import * as React from 'react'; 
import {IRouter} from './Util';
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
    constructor(props) {
        super(props);
        this.state = {};
    }
    
    render() {
        return null;
    }
}

export class IndexRoute extends React.Component<RouteProps,RouteState> {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return null;
    }
}
export class NotFoundRoute extends React.Component<RouteProps,RouteState> {
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