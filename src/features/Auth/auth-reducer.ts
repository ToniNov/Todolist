import {setAppStatusAC} from '../Application/application-reducer'
import {authAPI, FieldErrorType, LoginParamsType} from '../../api/todolists-api'
import {handleServerAppError, handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AxiosError} from "axios";

export const login =
    createAsyncThunk <
        undefined,
        LoginParamsType,
        {rejectValue:{errors:string[], fieldsErrors?:FieldErrorType[]}}
        >('auth/login',
        async (param, thunkAPI) => {
        thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
        try {
            const res = await authAPI.login(param)
            if (res.data.resultCode === 0) {
                thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
                return;
            } else {
                handleServerAppError(res.data, thunkAPI.dispatch)
                return thunkAPI.rejectWithValue({errors: res.data.messages, fieldsErrors: res.data.fieldsErrors});
            }
        } catch (err) {
            const error = err as AxiosError
            handleServerNetworkError(error, thunkAPI.dispatch)
            return  thunkAPI.rejectWithValue({errors:[error.message], fieldsErrors: undefined});
        }
    });

export const logout
    = createAsyncThunk('auth/logout', async(param, thunkAPI) => {
    thunkAPI.dispatch(setAppStatusAC({status: 'loading'}))
    try {
        const res = await authAPI.logout()
        if (res.data.resultCode === 0) {
            thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}))
            return;
        } else {
            handleServerAppError(res.data, thunkAPI.dispatch)
            return  thunkAPI.rejectWithValue({})
        }
    } catch (err) {
        const error = err as AxiosError
        handleServerNetworkError(error, thunkAPI.dispatch)
        return  thunkAPI.rejectWithValue({})
    }
})

export const asyncActions = {login,logout}

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
