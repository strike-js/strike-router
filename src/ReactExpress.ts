import {RouteDef} from './Util'; 
import {Middleware,RouteHistory} from './History'; 
import * as React from 'react'; 

function response(history:RouteHistory){
    function redirect(to:string){
        history.goTo(to);
    }

    function view<T>(component:React.ComponentClass<T>,props:T,children:React.ReactElement<any>){

    }

    return {
        redirect,
        view
    }
}

function ReactExpress(){
    var routes:RouteDef[] = [];
    var activeRoute:RouteDef = null;
    var middlewares:Middleware[] = []; 

    function use(path:string,middleware:Middleware);
    function use(middleware:Middleware);
    function use(...args:any[]){
        if (args.length === 1 && 
            typeof args[0] === "function"){
            middlewares.push(args[0]); 
            return o; 
        }else if (args.length === 2 && 
            typeof args[0] === "string" &&
            typeof args[1] === "function"){
            
        }
    }

    function route(){
        
    }


    var o = {
        use,
        route,
    };

    return o;

}