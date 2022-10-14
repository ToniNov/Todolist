import axios, {AxiosResponse} from 'axios'

const settings = {
    withCredentials: true,
    headers: {
        'API-KEY': '8167777a-ea65-4ab7-8aca-994fc49b12df'
    }
}
const instance = axios.create({
    baseURL: 'https://social-network.samuraijs.com/api/1.1/',
    ...settings
})

// api
export const todolistsAPI = {
    getTodolists(): Promise<TodolistType[]>{
        return instance.get<TodolistType[]>('todo-lists')
            .then(res => res.data)
    },
    createTodolist(title: string): Promise<ResponseType>  {
       return  instance.post<ResponseType<{ item: TodolistType }>>('todo-lists', {title: title})
            .then(res => res.data)
    },
    deleteTodolist(id: string): Promise<ResponseType>  {
        return  instance.delete<ResponseType>(`todo-lists/${id}`)
            .then(res => res.data)
    },
    updateTodolist(id: string, title: string): Promise<ResponseType>  {
        return instance.put<ResponseType>(`todo-lists/${id}`, {title: title})
            .then(res => res.data)
    },
    getTasks(todolistId: string): Promise<GetTasksResponse> {
        return instance.get<GetTasksResponse>(`todo-lists/${todolistId}/tasks`)
            .then(res => res.data)
    },
    deleteTask(todolistId: string, taskId: string): Promise<ResponseType> {
        return instance.delete<ResponseType>(`todo-lists/${todolistId}/tasks/${taskId}`)
            .then(res => res.data)
    },
    createTask(todolistId: string, taskTitile: string): Promise<ResponseType<{ item: TaskType}>> {
        return instance.post<ResponseType<{ item: TaskType}>>(`todo-lists/${todolistId}/tasks`, {title: taskTitile})
            .then(res => res.data)
    },
    updateTask(todolistId: string, taskId: string, model: UpdateTaskModelType): Promise<ResponseType<TaskType>> {
        return instance.put<ResponseType<TaskType>>(`todo-lists/${todolistId}/tasks/${taskId}`, model)
            .then(res => res.data)
    }
}


export type LoginParamsType = {
    email: string
    password: string
    rememberMe: boolean
    captcha?: string
}

export const authAPI = {
    login(data: LoginParamsType): Promise<LogInOutResponseType> {
        return instance.post<LogInOutResponseType>('auth/login', data)
        .then(res=> res.data)
    },
    logout(): Promise<LogInOutResponseType>{
        return instance.delete<LogInOutResponseType>('auth/login')
            .then(res=> res.data)
    },
    me(): Promise<MeResponseType> {
       return instance.get<MeResponseType>('auth/me')
           .then(res=> res.data)
    }
}

// types

export type LogInOutResponseType = ResponseType<{userId?: number}>

export type MeResponseType = ResponseType<{id: number; email: string; login: string}>

export type TodolistType = {
    id: string
    title: string
    addedDate: string
    order: number
}
export type ResponseType<D = {}> = {
    resultCode: number
    messages: Array<string>
    data: D
}
export enum TaskStatuses {
    New = 0,
    InProgress = 1,
    Completed = 2,
    Draft = 3
}
export enum TaskPriorities {
    Low = 0,
    Middle = 1,
    Hi = 2,
    Urgently = 3,
    Later = 4
}
export type TaskType = {
    description: string
    title: string
    status: TaskStatuses
    priority: TaskPriorities
    startDate: string
    deadline: string
    id: string
    todoListId: string
    order: number
    addedDate: string
}
export type UpdateTaskModelType = {
    title: string
    description: string
    status: TaskStatuses
    priority: TaskPriorities
    startDate: string
    deadline: string
}
export type GetTasksResponse = {
    error: string | null
    totalCount: number
    items: TaskType[]
}
