import {call, put, takeEvery, select} from "redux-saga/effects";
import {setAppStatusAC} from "../../app/app-reducer";
import {AxiosResponse} from "axios";
import {GetTasksResponse, ResponseType, TaskType, todolistsAPI, UpdateTaskModelType} from "../../api/todolists-api";
import {handleServerAppErrorSaga, handleServerNetworkErrorSaga} from "../../utils/error-utils";
import {addTaskAC, removeTaskAC, setTasksAC, UpdateDomainTaskModelType, updateTaskAC} from "./tasks-reducer";

export function* fetchTasksWorkerSaga(action: ReturnType<typeof fetchTasksSagaAC>) {

    yield put(setAppStatusAC('loading'))
    const data: GetTasksResponse = yield call(todolistsAPI.getTasks, action.todolistId)

    const tasks = data.items
    yield put(setTasksAC(tasks, action.todolistId))
    yield put(setAppStatusAC('succeeded'))
}

export const fetchTasksSagaAC = (todolistId: string) => ({type: 'TASK/FETCH-TASK-SAGA-AC', todolistId} as const)

export function* removeTaskWorkerSaga(action: ReturnType<typeof removeTaskSagaAC>) {
    const res: AxiosResponse<ResponseType> = yield call(todolistsAPI.deleteTask, action.todolistId, action.taskId)
    yield put(removeTaskAC(action.taskId, action.todolistId))
}

export const removeTaskSagaAC = (taskId: string, todolistId: string) => ({
    type: 'TASK/REMOVE-TASK-SAGA-AC', taskId, todolistId
} as const)

export function* addTaskWorkerSaga(action: ReturnType<typeof addTaskSagaAC>) {
    yield put(setAppStatusAC('loading'))
    try {
        const data: ResponseType<{ item: TaskType }> = yield call(todolistsAPI.createTask, action.todolistId, action.title)
        if (data.resultCode === 0) {
            const task = data.data.item
            yield put(addTaskAC(task))
            yield put(setAppStatusAC('succeeded'))
        } else {
            yield* handleServerAppErrorSaga(data);
        }
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error)
    }
}
export const addTaskSagaAC = (title: string, todolistId: string) => ({
    type: 'TASK/ADD-TASK-SAGA-AC', title, todolistId
} as const)


export function* updateTaskWorkerSaga(action: ReturnType<typeof updateTaskSagaAC>) {

    const tasks = yield select(state => state.tasks)

    const task = tasks[action.todolistId].find((t: TaskType) => t.id === action.taskId)
    if (!task) {
        console.warn('task not found in the state')
        return
    }

    const apiModel: UpdateTaskModelType = {
        deadline: task.deadline,
        description: task.description,
        priority: task.priority,
        startDate: task.startDate,
        title: task.title,
        status: task.status,
        ...action.domainModel
    }

    try {
        const data: ResponseType<{ item: TaskType }> = yield call(todolistsAPI.updateTask, action.todolistId, action.taskId, apiModel)
        if (data.resultCode === 0) {
            const task = data.data.item
            yield put(updateTaskAC(task.id, task, task.todoListId))
            yield put(setAppStatusAC('succeeded'))
        } else {
            yield* handleServerAppErrorSaga(data);
        }
    } catch (error) {
        yield* handleServerNetworkErrorSaga(error)
    }
}

export const updateTaskSagaAC = (taskId: string, domainModel: UpdateDomainTaskModelType, todolistId: string) => {
   return {type: 'TASK/UPDATE-TASK-SAGA-AC' , taskId , domainModel, todolistId}
}

export function* taskWatcherSaga(){
    yield takeEvery('TASK/FETCH-TASK-SAGA-AC', fetchTasksWorkerSaga)
    yield takeEvery('TASK/REMOVE-TASK-SAGA-AC', removeTaskWorkerSaga)
    yield takeEvery('TASK/ADD-TASK-SAGA-AC', addTaskWorkerSaga)
    yield takeEvery('TASK/UPDATE-TASK-SAGA-AC', updateTaskWorkerSaga)
}