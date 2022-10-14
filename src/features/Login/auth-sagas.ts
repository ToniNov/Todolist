import {call, put, takeEvery} from "redux-saga/effects";
import {setAppStatusAC} from "../../app/app-reducer";
import {authAPI, LoginParamsType} from "../../api/todolists-api";
import {handleServerAppErrorSaga, handleServerNetworkErrorSaga} from "../../utils/error-utils";
import {setIsLoggedInAC} from "./auth-reducer";

export function* loginWorkerSaga(action: ReturnType<typeof loginSagaAC>) {
    yield put(setAppStatusAC('loading'))
    try {
        const data  = yield call(authAPI.login, action.data)
        if (data.resultCode === 0) {
            yield put(setIsLoggedInAC(true))
            yield put(setAppStatusAC('succeeded'))
        } else {
            yield* handleServerAppErrorSaga(data);
        }
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error)
    }
}
export const loginSagaAC = (data: LoginParamsType) => ({type: 'AUTH/LOGIN-SAGA-AC' , data} as const)

export function* logoutWorkerSaga(action: ReturnType<typeof logoutSagaAC>) {
    yield put(setAppStatusAC('loading'))
    try {
        const data  = yield call(authAPI.logout)
        if (data.resultCode === 0) {
            yield put(setIsLoggedInAC(false))
            yield put(setAppStatusAC('succeeded'))
        } else {
            yield* handleServerAppErrorSaga(data);
        }
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error)
    }
}
export const logoutSagaAC = () => ({type: 'AUTH/LOGOUT-SAGA-AC' } as const)

export function* authWatcherSaga(){
    yield takeEvery('AUTH/LOGIN-SAGA-AC', loginWorkerSaga)
    yield takeEvery('AUTH/LOGOUT-SAGA-AC', logoutWorkerSaga )
}