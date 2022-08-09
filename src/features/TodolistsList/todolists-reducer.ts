import {todolistsAPI} from '../../api/todolists-api'
import {RequestStatusType,} from '../Application/application-reducer'
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {handleAsyncServerAppError, handleAsyncServerNetworkError} from "../../utils/error-utils";
import {appActions} from "../CommonActions/App";
import {ThunkError} from '../../utils/types';
import {TodolistType} from "../../api/types";

const {setAppStatus} = appActions

export const fetchTodolists = createAsyncThunk<{ todolists: TodolistType[] }, undefined, ThunkError>
('todolists/fetchTodolists', async (param, thunkAPI) => {
    thunkAPI.dispatch(setAppStatus({status: 'loading'}))
    try {
        const res = await todolistsAPI.getTodolists()
        thunkAPI.dispatch(setAppStatus({status: 'succeeded'}))
        return {todolists: res.data}
    } catch (error: any) {
        return handleAsyncServerNetworkError(error, thunkAPI)
    }
})

export const removeTodolist =
    createAsyncThunk<{id:string}, string, ThunkError>('todolists/removeTodolist', async (todolistId, {dispatch}) => {
        dispatch(setAppStatus({status: 'loading'}));
        dispatch(changeTodolistEntityStatus({id: todolistId, status: 'loading'}));
        const res = await todolistsAPI.deleteTodolist(todolistId);
        dispatch(setAppStatus({status: 'succeeded'}));
        return {id: todolistId};
    });

export const addTodolist = createAsyncThunk<{ todolist: TodolistType }, string, ThunkError>
('todolists/addTodolist', async (title: string, thunkAPI) => {
    thunkAPI.dispatch(setAppStatus({status: 'loading'}));
    try {
        const res = await todolistsAPI.createTodolist(title);
        if (res.data.resultCode === 0) {
            thunkAPI.dispatch(setAppStatus({status: 'succeeded'}));
            return {todolist: res.data.data.item};
        } else {
            return handleAsyncServerAppError(res.data, thunkAPI, false)
        }
    } catch (error: any) {
        return handleAsyncServerNetworkError(error, thunkAPI, false)
    }
});

export const changeTodolistTitle = createAsyncThunk('todolists/changeTodolistTitle', async (param: { id: string, title: string }, thunkAPI) => {
    try {
        const res = await todolistsAPI.updateTodolist(param.id, param.title);
        if (res.data.resultCode === 0) {
            thunkAPI.dispatch(setAppStatus({status: 'succeeded'}));
            return {id: param.id, title: param.title};
        } else {
            return handleAsyncServerAppError(res.data, thunkAPI);
        }
    } catch (error: any) {
        return handleAsyncServerNetworkError(error, thunkAPI, false);
    }
});

export const asyncActions = {addTodolist, changeTodolistTitle, fetchTodolists, removeTodolist}

export const slice = createSlice({
    name: 'todolist',
    initialState: [] as Array<TodolistDomainType>,
    reducers: {
        changeTodolistFilter(state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].filter = action.payload.filter;
        },
        changeTodolistEntityStatus(state, action: PayloadAction<{ id: string, status: RequestStatusType }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].entityStatus = action.payload.status;
        },
    },
    extraReducers: builder => {
        builder.addCase(fetchTodolists.fulfilled, (state, action) => {
            return action.payload.todolists.map((tl) => ({...tl, filter: 'all', entityStatus: 'idle'}))
        });
        builder.addCase(removeTodolist.fulfilled, (state, action) => {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            if (index > -1) {
                state.splice(index, 1)
            }
        });
        builder.addCase(addTodolist.fulfilled, (state, action) => {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        })
        builder.addCase(changeTodolistTitle.fulfilled, (state, action) => {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].title = action.payload.title
        })
    }
});

export const todolistsReducer = slice.reducer;

export const {changeTodolistFilter, changeTodolistEntityStatus} = slice.actions;

// types
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}

