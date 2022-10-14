import {addTaskWorkerSaga, fetchTasksWorkerSaga} from "./task-sagas";
import {call, put} from "redux-saga/effects";
import {setAppErrorAC, setAppStatusAC} from "../../app/app-reducer";
import {GetTasksResponse, TaskPriorities, TaskStatuses, todolistsAPI} from "../../api/todolists-api";
import {setTasksAC} from "./tasks-reducer";


beforeEach(() => {

})

test('fetchTasksWorkerSaga success flow', () => {

    let todolistId = "todolistId";

    const gen = fetchTasksWorkerSaga({type: 'TASK/FETCH-TASK-SAGA-AC' , todolistId: todolistId})

    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))

    expect(gen.next().value).toEqual(call(todolistsAPI.getTasks, todolistId))

    const fakeResponse: GetTasksResponse = {
        error: '',
        totalCount: 1,
        items: [{
            id: "1",
            title: "CSS",
            status: TaskStatuses.New,
            todoListId: "todolistId1",
            description: '',
            startDate: '',
            deadline: '',
            addedDate: '',
            order: 0,
            priority: TaskPriorities.Low
        },]
    }

    expect(gen.next(fakeResponse).value).toEqual(put(setTasksAC(fakeResponse.items,todolistId)))

    expect(gen.next().value).toEqual(put(setAppStatusAC('succeeded')))

})

test('addTaskWorkerSaga error flow', () => {

    let todolistId = "todolistId";
    let title = "task title";

    const gen = addTaskWorkerSaga({type: 'TASK/ADD-TASK-SAGA-AC' , todolistId: todolistId , title: title})

    expect(gen.next().value).toEqual(put(setAppStatusAC('loading')))
    expect(gen.next().value).toEqual(call(todolistsAPI.createTask, todolistId, title))
    expect(gen.throw({message: 'some error'}).value).toEqual(put(setAppErrorAC('some error')))
    expect(gen.next().value).toEqual(put(setAppStatusAC('failed')))

})

