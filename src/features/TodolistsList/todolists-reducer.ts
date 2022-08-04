import {todolistsAPI, TodolistType} from '../../api/todolists-api'
import {Dispatch} from 'redux'
import {RequestStatusType, setAppStatusAC,} from '../../app/app-reducer'
import {handleServerNetworkError} from '../../utils/error-utils'
import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AxiosError} from "axios";

export const fetchTodolistsTC =
    createAsyncThunk('todolists/fetchTodolists', async (param, {dispatch, rejectWithValue}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        const res = await todolistsAPI.getTodolists()
        try{
            dispatch(setAppStatusAC({status: 'succeeded'}))
            return {todolists: res.data}
        } catch (err) {
            const error = err as AxiosError
            handleServerNetworkError(error, dispatch);
            return rejectWithValue(null)
        }
    });

export const removeTodolistTC =
    createAsyncThunk('todolists/removeTodolistTC', async (todolistId: string, {dispatch}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        dispatch(changeTodolistEntityStatusAC({id: todolistId, status: 'loading'}))
        const res = await todolistsAPI.deleteTodolist(todolistId)
        dispatch(setAppStatusAC({status: 'succeeded'}))
        return {id: todolistId};
    })


export const addTodolistTC = (title: string) => {
    return (dispatch: Dispatch) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        todolistsAPI.createTodolist(title)
            .then((res) => {
                dispatch(addTodolistAC({todolist: res.data.data.item}))
                dispatch(setAppStatusAC({status: 'succeeded'}))
            })
    }
}

export const changeTodolistTitleTC = (id: string, title: string) => {
    return (dispatch: Dispatch) => {
        todolistsAPI.updateTodolist(id, title)
            .then((res) => {
                dispatch(changeTodolistTitleAC({id: id, title: title}))
            })
    }
}

const slice = createSlice({
    name: 'todolist',
    initialState: [] as Array<TodolistDomainType>,
    reducers: {
        addTodolistAC(state, action: PayloadAction<{todolist: TodolistType }>) {
            state.unshift({...action.payload.todolist, filter: 'all', entityStatus: 'idle'})
        },
        changeTodolistTitleAC(state, action: PayloadAction<{ id: string, title: string }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].title = action.payload.title
        },
        changeTodolistFilterAC(state, action: PayloadAction<{ id: string, filter: FilterValuesType }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].filter = action.payload.filter
        },
        changeTodolistEntityStatusAC(state, action: PayloadAction<{ id: string, status: RequestStatusType }>) {
            const index = state.findIndex(tl => tl.id === action.payload.id);
            state[index].entityStatus = action.payload.status
        },
    },
    extraReducers: builder =>  {
        builder.addCase(fetchTodolistsTC.fulfilled, (state, action)=>{
            return action.payload.todolists.map(tl => ({...tl, filter: 'all', entityStatus: 'idle'}))
        });
        builder.addCase(removeTodolistTC.fulfilled, (state, action)=>{
            const index = state.findIndex(tl => tl.id === action.payload.id);
            if (index > -1) {
                state.splice(index, 1)
            }
        })
    }
});

export const todolistsReducer = slice.reducer;

export const {
    addTodolistAC, changeTodolistTitleAC,
    changeTodolistFilterAC, changeTodolistEntityStatusAC
} = slice.actions;


// types
export type FilterValuesType = 'all' | 'active' | 'completed';
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType
    entityStatus: RequestStatusType
}

