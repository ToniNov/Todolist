import {authAPI} from '../../api/todolists-api'
import {setIsLoggedIn} from '../Auth/auth-reducer'
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {appActions} from '../CommonActions/App'

export const initializeApp =
    createAsyncThunk('application/initializeApp', async (param, {dispatch}) => {
    const res = await authAPI.me()
    if (res.data.resultCode === 0) {
        dispatch(setIsLoggedIn({value: true}));
    } else {

    }
})

export const asyncActions = {initializeApp}

export const slice = createSlice({
    name: 'application',
    initialState: {
        status: 'idle',
        error: null,
        isInitialized: false
    } as InitialStateType,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(initializeApp.fulfilled, (state, action) => {
                state.isInitialized = true
            })
            .addCase(appActions.setAppStatus, (state, action) => {
                state.status = action.payload.status
            })
            .addCase(appActions.setAppError, (state, action) => {
                state.error = action.payload.error
            })
    }
});

export const applicationReducer = slice.reducer;

export type RequestStatusType = 'idle' | 'loading' | 'succeeded' | 'failed'

export type InitialStateType = {
    status: RequestStatusType
    error: string | null
    isInitialized: boolean
}



