import {tasksReducer} from '../features/TodolistsList/tasks-reducer';
import {todolistsReducer} from '../features/TodolistsList/todolists-reducer';
import {applyMiddleware, combineReducers, createStore} from 'redux'
import thunkMiddleware from 'redux-thunk'
import {appReducer} from './app-reducer'
import {authReducer} from '../features/Login/auth-reducer'
import createSagaMiddleware from 'redux-saga'
import {all} from 'redux-saga/effects'
import {appWatcherSaga} from "./app-sagas";
import {authWatcherSaga} from "../features/Login/auth-sagas";
import {taskWatcherSaga} from "../features/TodolistsList/task-sagas";
import {todolistWatcherSaga} from "../features/TodolistsList/todolist-sagas";

const rootReducer = combineReducers({
    tasks: tasksReducer,
    todolists: todolistsReducer,
    app: appReducer,
    auth: authReducer
})

const sagaMiddleware = createSagaMiddleware()

export const store = createStore(rootReducer, applyMiddleware(thunkMiddleware, sagaMiddleware));

export type AppRootStateType = ReturnType<typeof rootReducer>

sagaMiddleware.run(rootWatcher)

function* rootWatcher() {
    yield all([appWatcherSaga(),authWatcherSaga(),taskWatcherSaga(),todolistWatcherSaga()])
}

// @ts-ignore
window.store = store;
