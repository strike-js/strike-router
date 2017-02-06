import {RouteGuard,RouteHistoryDelegate,RouteDef,Dictionary,IRouter} from './Util';
import {Constraint} from './Route';

export interface Middleware {
    (route:RouteDef,router:IRouter,next:(okay:boolean)=>void):void; 
}

/**
 * Interface that must be implemented by navigation history tracking classes.  
 */
export interface RouteHistory {
    /**
     * A list representing the navigation history of the user. 
     */
    history:string[]; 
    /**
     * Go one entry back in the navigation history. 
     */
    back();
    /**
     * Go one entry forward in the navigation history. 
     */
    next(); 
    /**
     * Get the previous route if there is one, null otherwise. 
     */
    prevRoute():string;
    /**
     * Get the current route. 
     */
    currentRoute():string;
    /**
     * Go to a given route. 
     * @param {string} newRoute the new route to go to 
     */
    goTo(newRoute:string);
    /**
     * Sets a guard on the current route such that navigation away can only 
     * happen if the guard allows it. 
     * @param {RouteGuard} guard the guard to secure the current route. 
     */
    setGuard(guard:RouteGuard):void;
    /**
     * Sets the delegate that will receive the route change events. 
     * @param {RouteHistoryDelegate} delegate the delegate to notify.
     */
    setDelegate(delegate:RouteHistoryDelegate); 
}

export function memoryHistory(initialRoute?:string):RouteHistory{
    let currentIndex:number = 0,
        guard:RouteGuard = null, 
        history:string[] = [initialRoute || '/'],
        enabled:boolean = true,
        delegate:RouteHistoryDelegate = null;

    function setDelegate(del:RouteHistoryDelegate){
        delegate = del; 
    }

    function doBackNext(inc:number){
        enabled = false; 
        currentIndex += inc; 
        location.hash = history[currentIndex];
    }

    function doGoTo(path:string){
        enabled = false; 
        currentIndex++;
        history.splice(currentIndex)
        history.push(path);
        location.hash = history[currentIndex];
    }

    function change(inc:number){
        let v = guard && guard.check(); 
        if (typeof v === "object" && v && v.then){
            v.then((okay)=>{
                if (okay){
                    doBackNext(inc);
                }
            })
        }else if ((typeof v === "boolean" && v) || !guard){
            doBackNext(inc);
        }
    }

    function back(){ 
        if (currentIndex > 0){
            change(-1);
        }
    }

    function next(){
        if (currentIndex < (history.length-1)){
            change(1);
        }
    }

    function goTo(path:string){
        if (guard){
            let v = guard.check(); 
            if (typeof v === "object" && v && v.then){
                v.then((okay)=>{
                    if (okay){
                        doGoTo(path);
                    }
                })
                return; 
            }
        }
        doGoTo(path);        
    }

    function prevRoute(){
        return currentIndex > 0?history[currentIndex-1]:null;
    }

    function currentRoute(){
        return history[currentIndex]; 
    }

    function setGuard(g:RouteGuard){
        guard = g;
    }

    return {
        setDelegate,
        currentRoute,
        prevRoute,
        history,
        back,
        next,
        goTo,
        setGuard,
    }
}

/**
 * Creates a history that tracks and manages hash changes. 
 */
export function hashHistory():RouteHistory{
    let currentIndex:number = 0,
        guard:RouteGuard = null,
        history:string[] = [location.hash.substr(1)], 
        enabled:boolean = true,
        delegate:RouteHistoryDelegate = null;
    window.addEventListener('hashchange',onHashChange); 

    function onHashChange(){
        if (enabled){
            currentIndex++;
            let newHash = location.hash.substr(1);
            if (currentIndex < history.length){
                history.splice(currentIndex);
            }
            history.push(newHash);
        }
        enabled = true;
        onChange();
    }

    function onChange(){
        delegate && delegate.onRouteChange(history[currentIndex],currentIndex > 0?history[currentIndex-1]:null);
    }

    function setDelegate(del:RouteHistoryDelegate){
        delegate = del; 
        delegate && delegate.onRouteChange(history[currentIndex],currentIndex > 0?history[currentIndex-1]:null);
    }

    function doBackNext(inc:number){
        enabled = false; 
        currentIndex += inc; 
        if (location.hash.substr(1) === history[currentIndex]){
            enabled = true;
        }
        location.hash = history[currentIndex];
    }

    function doGoTo(path:string){
        enabled = false; 
        if (path !== history[currentIndex]){
            currentIndex++;
            history.splice(currentIndex)
            history.push(path);
        }
        if (location.hash.substr(1) === history[currentIndex]){
            enabled = true;
        }
        location.hash = history[currentIndex];
    }

    function change(inc:number){
        let v = guard && guard.check(); 
        if (typeof v === "object" && v && v.then){
            v.then((okay)=>{
                if (okay){
                    doBackNext(inc);
                }
            })
        }else if ((typeof v === "boolean" && v) || !guard){
            doBackNext(inc);
        }
    }

    function back(){ 
        if (currentIndex > 0){
            change(-1);
        }
    }

    function next(){
        if (currentIndex < (history.length-1)){
            change(1);
        }
    }

    function goTo(path:string){
        let v = guard && guard.check(); 
        if (typeof v === "object" && v && v.then){
            v.then((okay)=>{
                if (okay){
                    doGoTo(path);
                }
            })
            return; 
        }else if ((typeof v === "boolean" && v) || !guard){
            doGoTo(path);
        }    
    }

    function prevRoute(){
        return currentIndex > 0?history[currentIndex-1]:null;
    }

    function currentRoute(){
        return history[currentIndex]; 
    }

    function setGuard(g:RouteGuard){
        guard = g;
    }

    return {
        setDelegate,
        currentRoute,
        prevRoute,
        history,
        back,
        next,
        goTo,
        setGuard,
    }
}

/**
 * Creates a history that tracks and manages pop state history. 
 */
export function popStateHistory(root:string):RouteHistory{
    let enabled:boolean = true,
        currentIndex = 0,
        guard:RouteGuard = null,
        hist:string[] = [getRoute(location.pathname)],
        delegate:RouteHistoryDelegate = null;
    
    window.addEventListener('popstate',onPopStateChange);

    function getRoute(path:string){
        return path.replace(root,'') || '/'; 
    } 

    function onPopStateChange(event:PopStateEvent){
        if (enabled){
            currentIndex++;
            let newHash = getRoute(location.pathname);
            if (currentIndex === history.length){
                hist.push(newHash);
            }else {
                hist.splice(currentIndex);
                hist[currentIndex] = newHash; 
            }
        }
        enabled = true;
        onChange();
    }

    function onChange(){
        delegate && delegate.onRouteChange(hist[currentIndex],currentIndex > 0?hist[currentIndex-1]:null);
    }

    function setDelegate(del:RouteHistoryDelegate){
        delegate = del; 
    }

    function doBackNext(inc:number){
        enabled = false;
        currentIndex += inc; 
        inc === -1?window.history.back():window.history.forward();
    }

    function change(inc:number){
        let v = guard && guard.check(); 
        if (v && typeof v === "object"){
            v.then((okay)=>{
                if (okay){
                    doBackNext(inc); 
                }
            });
        }else if (!guard || (typeof v === "boolean" && v)){
            doBackNext(inc);
        }
    }

    function back(){ 
        if (currentIndex > 0){
            change(-1);
        }
    }

    function next(){
        if (currentIndex < (hist.length-1)){
            change(1);
        }
    }

    function doGoTo(path:string){
        enabled = false;
        currentIndex++; 
        if (currentIndex < hist.length){
            hist.splice(currentIndex); 
        }
        window.history.pushState({
            index:currentIndex
        },'',getRoute(path));
    }

    function goTo(path:string){
        let v = guard && guard.check(path); 
        if (typeof v === "object" && v.then){
            return v.then((okay)=>{
                if (okay){
                    doGoTo(path); 
                }
            }); 
        }else if (!guard || (typeof v === "boolean" && v)){
            doGoTo(path);
        }
    }

    function prevRoute(){
        return currentIndex > 0?hist[currentIndex-1]:null;
    }

    function currentRoute(){
        return getRoute(location.pathname); 
    }

    function setGuard(g:RouteGuard){
        guard = g;
    }


    return {
        setDelegate,
        currentRoute,
        prevRoute,
        history:[],
        setGuard,
        back,
        next,
        goTo,
    }
}