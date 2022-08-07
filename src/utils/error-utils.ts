import {
    setAppErrorAC,
    SetAppErrorActionType,
    setAppStatusAC,
    SetAppStatusActionType
} from '../features/Application/application-reducer'
import {ResponseType} from '../api/todolists-api'
import {Dispatch} from 'redux'
import {AxiosError} from "axios";

export const handleServerAppError = <D>(data: ResponseType<D>,
                                        dispatch: Dispatch<SetAppErrorActionType | SetAppStatusActionType>,
                                        showError = true) => {
    if (showError) {
        dispatch(setAppErrorAC({error: data.messages.length ? data.messages[0] : 'Some error occurred'}))
    }
    dispatch(setAppStatusAC({status: 'failed'}))
}

export const handleServerNetworkError = (error: AxiosError<{ message: string }>,
                                         dispatch: Dispatch<SetAppErrorActionType | SetAppStatusActionType>,
                                         showError = true) => {
    if (showError) {
        dispatch(setAppErrorAC({error: error.message ? error.message : 'Some error occurred'}))
    }
    dispatch(setAppStatusAC({status: 'failed'}))
}
