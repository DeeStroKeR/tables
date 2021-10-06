import React, { useReducer } from 'react';
import { Router, Route, Switch } from "react-router-dom";
import { createBrowserHistory } from 'history';

import Table from './Table';
import Comments from './comments';
import NotFound from './NotFound';

const history = createBrowserHistory();
export const Context = React.createContext();

export const ADD_LIST_ITEMS = 'ADD_LIST_ITEMS';
export const SET_LIST_NUMBER = 'SET_LIST_NUMBER';
export const SET_PAGE_NUMBER = 'SET_PAGE_NUMBER';
export const SET_FILTER = 'SET_FILTER';
export const CLEAR_LIST_ITEMS = 'CLEAR_LIST_ITEMS';
export const SET_COMMENTS = 'SET_COMMENTS';
export const CLEAR_COMMENTS = 'CLEAR_COMMENTS';

const initialState = {
    items: [],
    comments: [],
    listNumber: 0,
    pageNumber: 1,
    filter: {}
}

const reducer = (state, action) => {
    switch (action.type) {
        case ADD_LIST_ITEMS:
            return {
                ...state,
                items: [...state.items, ...action.payload]
            }
        case SET_LIST_NUMBER:
            return {
                ...state,
                listNumber: action.payload
            }
        case SET_PAGE_NUMBER:
            return {
                ...state,
                pageNumber: action.payload
            }
        case SET_FILTER:
            return {
                ...state,
                filter: action.payload
            }
        case CLEAR_LIST_ITEMS:
            return {
                ...state,
                items: []
            }
        case SET_COMMENTS:
            return {
                ...state,
                comments: action.payload.comments
            }
        case CLEAR_COMMENTS:
            return {
                ...state,
                comments: []
            }
        default:
            return state
    }
}

export default function App() {
    const [state, dispatch] = useReducer(reducer, initialState);
    return (
    <Context.Provider
        value={{ state, dispatch }}>
        <Router history={history}>
            <Switch>
                <Route path="/" exact component={Table} />
                <Route path="/comments/" exact component={Comments} />
                <Route component={NotFound} />
            </Switch>
        </Router>
    </Context.Provider>
    )
}
