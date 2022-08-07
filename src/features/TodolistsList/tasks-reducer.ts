import {
    FieldErrorType,
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    UpdateTaskModelType
} from '../../api/todolists-api'
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {setAppStatusAC} from "../Application/application-reducer";
import {handleServerAppError, handleServerNetworkError} from "../../utils/error-utils";
import {AxiosError} from "axios";
import {AppRootStateType, ThunkError} from "../../app/store";
import {asyncActions as asyncTodolistsActions} from "./todolists-reducer";

const fetchTasks =
    createAsyncThunk('tasks/fetchTasks', async (todolistId: string, thunkAPI) => {
        thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
        const res = await todolistsAPI.getTasks(todolistId);
        const tasks = res.data.items;
        thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
        return {tasks, todolistId};
    });

const removeTask =
    createAsyncThunk('tasks/removeTask', async (param: { taskId: string, todolistId: string }, thunkAPI) => {
        const res = await todolistsAPI.deleteTask(param.todolistId, param.taskId);
        return {taskId: param.taskId, todolistId: param.todolistId};
    });

const addTask = createAsyncThunk<TaskType,{ title: string, todolistId: string },ThunkError>
    ('tasks/addTask', async (param, thunkAPI) => {
        thunkAPI.dispatch(setAppStatusAC({status: 'loading'}));
        try {
            const res = await todolistsAPI.createTask(param.todolistId, param.title);
            if (res.data.resultCode === 0) {
                thunkAPI.dispatch(setAppStatusAC({status: 'succeeded'}));
                return res.data.data.item;
            } else {
                handleServerAppError(res.data, thunkAPI.dispatch, false);
                return thunkAPI.rejectWithValue({errors: res.data.messages, fieldsErrors: res.data.fieldsErrors});
            }
        } catch (error) {
            handleServerNetworkError(error, thunkAPI.dispatch, false);
            return rejectWithValue({errors: [error.message], fieldsErrors: undefined});
        }
    });

const updateTask =
    createAsyncThunk('tasks/updateTask',
        async (param: { taskId: string, model: UpdateDomainTaskModelType, todolistId: string },
               {dispatch, rejectWithValue, getState}) => {
            const state = getState() as AppRootStateType
            const task = state.tasks[param.todolistId].find(t => t.id === param.taskId);
            if (!task) {
                return rejectWithValue('task not found in the state');
            }

            const apiModel: UpdateTaskModelType = {
                deadline: task.deadline,
                description: task.description,
                priority: task.priority,
                startDate: task.startDate,
                title: task.title,
                status: task.status,
                ...param.model
            }

            const res = await todolistsAPI.updateTask(param.todolistId, param.taskId, apiModel);
            try {
                if (res.data.resultCode === 0) {
                    return param;
                } else {
                    handleServerAppError(res.data, dispatch);
                    return rejectWithValue(null);
                }
            } catch (err) {
                const error = err as AxiosError
                handleServerNetworkError(error, dispatch, false);
                return rejectWithValue(null);
            }
        });

export const asyncActions = {addTask, fetchTasks, removeTask, updateTask}

const slice = createSlice({
    name: 'tasks',
    initialState: {} as TasksStateType,
    reducers: {},
    extraReducers: builder => {
        builder.addCase(asyncTodolistsActions.addTodolist.fulfilled, (state, action) => {
            state[action.payload.todolist.id] = []
        });
        builder.addCase(asyncTodolistsActions.removeTodolist.fulfilled, (state, action) => {
            delete state[action.payload.id]
        });
        builder.addCase(asyncTodolistsActions.fetchTodolists.fulfilled, (state, action) => {
            action.payload.todolists.forEach((tl: any) => {
                state[tl.id] = []
            })
        });
        builder.addCase(fetchTasks.fulfilled, (state, action) => {
            state[action.payload.todolistId] = action.payload.tasks
        });
        builder.addCase(removeTask.fulfilled, (state, action) => {
            const tasks = state[action.payload.todolistId];
            const index = tasks.findIndex(t => t.id === action.payload.taskId);
            if (index > -1) {
                tasks.splice(index, 1)
            }
        });
        builder.addCase(addTask.fulfilled, (state, action) => {
            state[action.payload.todoListId].unshift(action.payload);
        });
        builder.addCase(updateTask.fulfilled, (state, action) => {
            const tasks = state[action.payload.todolistId];
            const index = tasks.findIndex(t => t.id === action.payload.taskId);
            if (index > -1) {
                tasks[index] = {...tasks[index], ...action.payload.model}
            }
        })
    }
});

export const tasksReducer = slice.reducer;

// types
export type UpdateDomainTaskModelType = {
    title?: string
    description?: string
    status?: TaskStatuses
    priority?: TaskPriorities
    startDate?: string
    deadline?: string
}

export type TasksStateType = {
    [key: string]: Array<TaskType>
}

