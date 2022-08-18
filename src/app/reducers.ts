import {combineReducers} from "redux";
import {appReducer} from "../features/Application";
import {authReducer} from "../features/Auth";
import {tasksReducer, todolistsReducer} from "../features/TodolistsList";

// объединяя reducer-ы с помощью combineReducers,
// мы задаём структуру нашего единственного объекта-состояния

export const rootReducer = combineReducers({
    app: appReducer,
    auth: authReducer,
    todolists: todolistsReducer,
    tasks: tasksReducer
})