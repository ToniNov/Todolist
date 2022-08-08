import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AxiosError} from "axios";
import {appActions} from "../CommonActions/App";
import {handleAsyncServerAppError, handleAsyncServerNetworkError} from "../../utils/error-utils";
import {ThunkError} from "../../utils/types";
import { LoginParamsType } from "../../api/types";
import {authAPI} from "../../api/todolists-api";

export const login = createAsyncThunk<undefined, LoginParamsType, ThunkError>
('auth/login', async (param, thunkAPI) => {
    thunkAPI.dispatch(appActions.setAppStatus({status: 'loading'}))
    try {
        const res = await authAPI.login(param)
        if (res.data.resultCode === 0) {
            thunkAPI.dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return
        } else {
            handleAsyncServerAppError(res.data, thunkAPI)
            return thunkAPI.rejectWithValue({errors: res.data.messages, fieldsErrors: res.data.fieldsErrors});
        }
    } catch (err) {
        const error = err as AxiosError
        handleAsyncServerNetworkError(error, thunkAPI)
        return thunkAPI.rejectWithValue({errors: [error.message], fieldsErrors: undefined});
    }
});

export const logout
    = createAsyncThunk('auth/logout', async (param, thunkAPI) => {
    thunkAPI.dispatch(appActions.setAppStatus({status: 'loading'}))
    try {
        const res = await authAPI.logout()
        if (res.data.resultCode === 0) {
            thunkAPI.dispatch(appActions.setAppStatus({status: 'succeeded'}))
            return;
        } else {
            handleAsyncServerAppError(res.data, thunkAPI)
            return thunkAPI.rejectWithValue({})
        }
    } catch (err) {
        const error = err as AxiosError
        handleAsyncServerNetworkError(error, thunkAPI)
        return thunkAPI.rejectWithValue({})
    }
})

export const asyncActions = {login, logout}

export const slice = createSlice({
    name: 'auth',
    initialState: {
        isLoggedIn: false
    },
    reducers: {
        setIsLoggedIn(state, action: PayloadAction<{ value: boolean }>) {
            state.isLoggedIn = action.payload.value;
        }
    },
    extraReducers: builder => {
        builder.addCase(login.fulfilled, (state) => {
            state.isLoggedIn = true;
        })
        builder.addCase(logout.fulfilled, (state) => {
            state.isLoggedIn = false;
        })
    },
});

export const authReducer = slice.reducer;
export const {setIsLoggedIn} = slice.actions;
