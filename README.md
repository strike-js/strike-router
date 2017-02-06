# strikejs-router

A declarative router for ReactJS applications written in TypeScript. 

## Examples 

### Example 1 

Simple application 

```typescript

    import {Router,createDataStore,hashHistory,Route,AuthRoute,Redirect} from 'strikejs-router';
    import {React} from 'react'; 
    import {ReactDOM} from 'react-dom'; 


    var el = document.createElement('div');
    el.id = "RouterContainer";
    document.querySelector('body').appendChild(el);


    ReactDOM.render(
            <Router history={hashHistory()}>
                <Route path="/note/:id" component={C1} props={C1Props} />
                <Route path="/app/:id" component={C2} props={C2Props} />
                <Route path="/gool">
                    <Route path="zeta" component={C3} props={C3Props} />
                </Route>
            </Router>,
            el);





```