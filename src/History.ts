import {RouteGuard,RouteHistoryDelegate} from './Util';
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
            if (currentIndex === history.length){
                history.push(newHash);
            }else {
                history.splice(currentIndex);
                history[currentIndex] = newHash; 
            }
        }
        enabled = true;
        onChange();
    }

    function onChange(){
        delegate && delegate.onRouteChange(history[currentIndex],currentIndex > 0?history[currentIndex-1]:null);
    }

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