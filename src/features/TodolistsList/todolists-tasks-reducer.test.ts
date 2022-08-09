import { TodolistType } from "../../api/types";
import {TasksStateType} from "./tasks-reducer";
import { TodolistDomainType } from "./todolists-reducer";
import {tasksReducer, todolistsActions, todolistsReducer} from "./index";
import {useActions} from "../../utils/redux-utils";

test('ids should be equals', () => {

    const {addTodolist} = useActions(todolistsActions)

    const startTasksState: TasksStateType = {};
    const startTodolistsState: Array<TodolistDomainType> = [];
    
    let todolist: TodolistType = {
        title: 'new todolist',
        id: 'any id',
        addedDate: '',
        order: 0
    }

    const action = addTodolist.fulfilled({todolist}, 'requestId', todolist.title);

    const endTasksState = tasksReducer(startTasksState, action)
    const endTodolistsState = todolistsReducer(startTodolistsState, action)

    const keys = Object.keys(endTasksState);
    const idFromTasks = keys[0];
    const idFromTodolists = endTodolistsState[0].id;

    expect(idFromTasks).toBe(action.payload.todolist.id);
    expect(idFromTodolists).toBe(action.payload.todolist.id);
});
