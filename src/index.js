import React                                                      from 'react';
import ReactDOM                                                   from 'react-dom';
import { composeWithDevTools }                                    from 'redux-devtools-extension';
import { Provider }                                               from 'react-redux';
import { Router, Route, Switch }                                  from 'react-router';
import { createHashHistory }                                      from 'history';
import MyArScene                                                       from './MyArScene';

const history = createHashHistory();

ReactDOM.render(
    <Router history={history}>
      <Switch>
        <Route path="*" component={MyArScene} />
      </Switch>
    </Router>
  , document.getElementById('root')
);
