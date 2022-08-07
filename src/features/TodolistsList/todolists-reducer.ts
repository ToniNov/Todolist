import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {RequestStatusType, setAppStatusAC,} from '../Application/application-reducer'
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AxiosError} from "axios";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";

const fetchTodolists =
    createAsyncThunk('todolists/fetchTodolists', async (param, {dispatch, rejectWithValue}) => {
        dispatch(setAppStatusAC({status: 'loading'}));
        const res = await todolistsAPI.getTodolists();
        try {
            dispatch(setAppStatusAC({status: 'succeeded'}));
            return {todolists: res.data}
        } catch (err) {
            const error = err as AxiosError
            handleServerNetworkError(error, dispatch);
            return rejectWithValue(null);
        }
    });

const removeTodolist =
    createAsyncThunk('todolists/removeTodolist', async (todolistId: string, {dispatch}) => {
        dispatch(setAppStatusAC({status: 'loading'}));
        dispatch(changeTodolistEntityStatus({id: todolistId, status: 'loading'}));
        const res = await todolistsAPI.deleteTodolist(todolistId);
        dispatch(setAppStatusAC({status: 'succeeded'}));
        return {id: todolistId};
    });

const addTodolist =
    createAsyncThunk('todolists/addTodolist', async (title: string, {dispatch, rejectWithValue}) => {
        dispatch(setAppStatusAC({status: 'loading'}));
        try {
            const res = await todolistsAPI.createTodolist(title);
            if (res.data.resultCode === 0){
                dispatch(setAppStatusAC({status: 'succeeded'}));
                return {todolist: res.data.data.item};
            } else {
                handleServerAppError(res.data, dispatch);
                return rejectWithValue(null);
            }
        }
        catch (err) {
            const error = err as AxiosError
            handleServerNetworkError(error, dispatch);
            return rejectWithValue(null);
        }
    });

export const changeTodolistTitle =
    createAsyncThunk('todolists/achangeTodolistTitleTC', async (param: { id: string, title: string }, {dispatch}) => {
        await todolistsAPI.updateTodolist(param.id, param.title);
        return {id: param.id, title: param.title};
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
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
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

