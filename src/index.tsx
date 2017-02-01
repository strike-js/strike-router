import {Router} from './Router'; 
import {Route,IndexRoute,NotFoundRoute,Redirect,AuthRoute} from './Route';
import {hashHistory,popStateHistory} from './History'; 
import {identity,createDataStore,getSet,parseRoute} from './Util'; 

export {Router,Route,IndexRoute,NotFoundRoute,
    Redirect,hashHistory,popStateHistory,
    identity,createDataStore,AuthRoute,getSet,
    parseRoute}

(function(StrikeJS:any){
    if (window){
        StrikeJS.Router = Router;
        StrikeJS.IndexRoute = IndexRoute;
        StrikeJS.NotFoundRoute = NotFoundRoute;
        StrikeJS.Redirect = Redirect;
        StrikeJS.hashHistory = hashHistory;
        StrikeJS.identity = identity; 
        StrikeJS.AuthRoute = AuthRoute; 
        StrikeJS.popStateHistory = popStateHistory; 
        StrikeJS.createDataStore = createDataStore; 
    }
}((window as any).StrikeJS = (window as any).StrikeJS || {}))