//saga
import {call, put, takeEvery} from "redux-saga/effects";
import {setAppStatusAC} from "../../app/app-reducer";
import {
    addTodolistAC,
    changeTodolistEntityStatusAC,
    changeTodolistTitleAC,
    removeTodolistAC,
    setTodolistsAC
} from "./todolists-reducer";
import {ResponseType, todolistsAPI, TodolistType} from "../../api/todolists-api";
import {handleServerAppErrorSaga, handleServerNetworkErrorSaga} from "../../utils/error-utils";

export function* fetchTodolistsWorkerSaga(action: ReturnType<typeof fetchTodolistsSagaAC>) {
    yield put(setAppStatusAC('loading'))
    const data: TodolistType[] = yield call(todolistsAPI.getTodolists)
    try{
        yield put(setTodolistsAC(data))
    }
    catch (error) {
        yield* handleServerNetworkErrorSaga(error)
    }
}
export const fetchTodolistsSagaAC = () => ({type: 'TODOLIST/FETCH-TODOLIST-SAGA-AC' } as const)

export function* removeTodolistWorkerSaga(action: ReturnType<typeof removeTodolistSagaAC>) {
    yield put(setAppStatusAC('loading'))
    yield put(changeTodolistEntityStatusAC(action.todolistId, 'loading'))
    const data: ResponseType = yield call(todolistsAPI.deleteTodolist, action.todolistId)
    try {
        yield put(removeTodolistAC(action.todolistId))
        yield put(setAppStatusAC('succeeded'))
    }
    catch (error) {
        yield* handleServerNetworkErrorSaga(error)
    }
}
export const removeTodolistSagaAC = (todolistId: string) => ({type: 'TODOLIST/REMOVE-TODOLIST-SAGA-AC', todolistId } as const)

export function* addTodolistWorkerSaga(action: ReturnType<typeof addTodolistSagaAC>) {
    yield put(setAppStatusAC('loading'))
    const data: ResponseType<{ item: TodolistType }> = yield call(todolistsAPI.createTodolist, action.title)
    try{
        yield put(addTodolistAC(data.data.item))
        yield put(setAppStatusAC('succeeded'))
    }
    catch (error) {
        yield* handleServerNetworkErrorSaga(error)
    }
}
export const addTodolistSagaAC = (title: string) => ({type: 'TODOLIST/ADD-TODOLIST-SAGA-AC', title } as const)

export function* changeTodolistTitleWorkerSaga(action: ReturnType<typeof changeTodolistTitleSagaAC>) {
    try {
        const data: ResponseType = yield call(todolistsAPI.updateTodolist , action.id ,action.title)
        if (data.resultCode === 0) {
            yield put(changeTodolistTitleAC(action.id, action.title))
            yield put(setAppStatusAC( 'succeeded'))
        } else {
            yield* handleServerAppErrorSaga(data);
        }
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error)
    }
}
export const changeTodolistTitleSagaAC = (id: string, title: string) => ({type: 'TODOLIST/CHANGETITLE-TODOLIST-SAGA-AC', id, title } as const)

export function* todolistWatcherSaga(){
    yield takeEvery('TODOLIST/FETCH-TODOLIST-SAGA-AC', fetchTodolistsWorkerSaga)
    yield takeEvery('TODOLIST/REMOVE-TODOLIST-SAGA-AC', removeTodolistWorkerSaga)
    yield takeEvery('TODOLIST/ADD-TODOLIST-SAGA-AC', addTodolistWorkerSaga)
    yield takeEvery('TODOLIST/CHANGETITLE-TODOLIST-SAGA-AC', changeTodolistTitleWorkerSaga)
}