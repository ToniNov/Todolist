import {createAsyncThunk} from "@reduxjs/toolkit";
import {setAppStatusAC} from "../../app/app-reducer";
import {todolistsAPI} from "../../api/todolists-api";
import {AxiosError} from "axios";
import {handleServerNetworkError} from "../../utils/error-utils";
import {changeTodolistEntityStatus} from "./todolists-reducer";

export const fetchTodolists =
    createAsyncThunk('todolists/fetchTodolists', async (param, {dispatch, rejectWithValue}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        const res = await todolistsAPI.getTodolists()
        try {
            dispatch(setAppStatusAC({status: 'succeeded'}))
            return {todolists: res.data}
        } catch (err) {
            const error = err as AxiosError
            handleServerNetworkError(error, dispatch);
            return rejectWithValue(null)
        }
    });

export const removeTodolist =
    createAsyncThunk('todolists/removeTodolist', async (todolistId: string, {dispatch}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        dispatch(changeTodolistEntityStatus({id: todolistId, status: 'loading'}))
        const res = await todolistsAPI.deleteTodolist(todolistId)
        dispatch(setAppStatusAC({status: 'succeeded'}))
        return {id: todolistId};
    })

export const addTodolist =
    createAsyncThunk('todolists/addTodolist', async (title: string, {dispatch}) => {
        dispatch(setAppStatusAC({status: 'loading'}))
        const res = await todolistsAPI.createTodolist(title)
        dispatch(setAppStatusAC({status: 'succeeded'}))
        return {todolist: res.data.data.item};
    })

export const changeTodolistTitle =
    createAsyncThunk('todolists/achangeTodolistTitleTC', async (param: { id: string, title: string }, {dispatch}) => {
        await todolistsAPI.updateTodolist(param.id, param.title)
        return {id: param.id, title: param.title}
    })