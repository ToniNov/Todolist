import axios from 'axios'
import {GetTasksResponse, LoginParamsType,ResponseTypeApi, TaskType, TodolistType, UpdateTaskModelType} from "./types";

const settings = {
    withCredentials: true,
    headers: {
        //'API-KEY': '8167777a-ea65-4ab7-8aca-994fc49b12df'
        'API-KEY': process.env.REACT_APP_API_KEY,
    }
}
const instance = axios.create({
    baseURL: 'https://social-network.samuraijs.com/api/1.1/',
    ...settings
})

// api
export const todolistsAPI = {
    getTodolists() {
        const promise = instance.get<TodolistType[]>('todo-lists');
        return promise;
    },
    createTodolist(title: string) {
        const promise = instance.post<ResponseTypeApi<{ item: TodolistType }>>('todo-lists', {title: title});
        return promise;
    },
    deleteTodolist(id: string) {
        const promise = instance.delete<ResponseTypeApi>(`todo-lists/${id}`);
        return promise;
    },
    updateTodolist(id: string, title: string) {
        const promise = instance.put<ResponseTypeApi>(`todo-lists/${id}`, {title: title});
        return promise;
    },
    getTasks(todolistId: string) {
        return instance.get<GetTasksResponse>(`todo-lists/${todolistId}/tasks`);
    },
    deleteTask(todolistId: string, taskId: string) {
        return instance.delete<ResponseTypeApi>(`todo-lists/${todolistId}/tasks/${taskId}`);
    },
    createTask(todolistId: string, taskTitile: string) {
        return instance.post<ResponseTypeApi<{ item: TaskType}>>(`todo-lists/${todolistId}/tasks`, {title: taskTitile});
    },
    updateTask(todolistId: string, taskId: string, model: UpdateTaskModelType) {
        return instance.put<ResponseTypeApi<TaskType>>(`todo-lists/${todolistId}/tasks/${taskId}`, model);
    }
}

export const authAPI = {
    login(data: LoginParamsType) {
        const promise = instance.post<ResponseTypeApi<{userId?: number}>>('auth/login', data);
        return promise;
    },
    logout() {
        const promise = instance.delete<ResponseTypeApi<{userId?: number}>>('auth/login');
        return promise;
    },
    me() {
       const promise =  instance.get<ResponseTypeApi<{id: number; email: string; login: string}>>('auth/me');
       return promise
    }
}


