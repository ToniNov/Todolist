import React, {useCallback, useEffect} from 'react'
import {AddItemForm} from '../../../components/AddItemForm/AddItemForm'
import {EditableSpan} from '../../../components/EditableSpan/EditableSpan'
import {Button, IconButton} from '@material-ui/core'
import {Delete} from '@material-ui/icons'
import {Task} from './Task/Task'
import {TaskStatuses, TaskType} from '../../../api/todolists-api'
import {TodolistDomainType} from '../todolists-reducer'
import {useActions} from "../../../app/store";
import {tasksActions, todolistsActions} from "../index";

type PropsType = {
    todolist: TodolistDomainType
    tasks: Array<TaskType>
    demo?: boolean
}

export const Todolist = React.memo(function ({demo = false, ...props}: PropsType) {
    console.log('Todolist called')

    const {changeTodolistFilter, removeTodolist, changeTodolistTitle} = useActions(todolistsActions)
    const {addTask, fetchTasks, updateTask, removeTask} = useActions(tasksActions)

    useEffect(() => {
        if (demo) {
            return
        }
        fetchTasks(props.todolist.id)
    }, [])

    const changeTaskStatus = useCallback(function (id: string, status: TaskStatuses, todolistId: string) {
        updateTask({taskId: id, model: {status}, todolistId})
    }, [])

    const changeTaskTitle = useCallback(function (id: string, newTitle: string, todolistId: string) {
        updateTask({taskId: id, model: {title: newTitle}, todolistId})
    }, [])

    const addTaskCallback = useCallback((title: string) => {
        addTask({title: title, todolistId: props.todolist.id})
    }, [props.todolist.id])

    const removeTodolistCallback = () => {
        removeTodolist(props.todolist.id)
    }
    const changeTodolistTitleCallback = useCallback((title: string) => {
        changeTodolistTitle({id: props.todolist.id, title: title})
    }, [props.todolist.id])

    const onAllClickHandler = useCallback(() =>
        changeTodolistFilter({filter: 'all', id: props.todolist.id}), [props.todolist.id])
    const onActiveClickHandler = useCallback(() =>
        changeTodolistFilter({filter: 'active', id: props.todolist.id}), [props.todolist.id])
    const onCompletedClickHandler = useCallback(() =>
        changeTodolistFilter({filter: 'completed', id: props.todolist.id}), [props.todolist.id])


    let tasksForTodolist = props.tasks

    if (props.todolist.filter === 'active') {
        tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.New)
    }
    if (props.todolist.filter === 'completed') {
        tasksForTodolist = props.tasks.filter(t => t.status === TaskStatuses.Completed)
    }

    return <div>
        <h3><EditableSpan value={props.todolist.title} onChange={changeTodolistTitleCallback}/>
            <IconButton onClick={removeTodolistCallback} disabled={props.todolist.entityStatus === 'loading'}>
                <Delete/>
            </IconButton>
        </h3>
        <AddItemForm addItem={addTaskCallback} disabled={props.todolist.entityStatus === 'loading'}/>
        <div>
            {
                tasksForTodolist.map(t => <Task key={t.id} task={t} todolistId={props.todolist.id}
                                                removeTask={removeTask}
                                                changeTaskTitle={changeTaskTitle}
                                                changeTaskStatus={changeTaskStatus}
                />)
            }
        </div>
        <div style={{paddingTop: '10px'}}>
            <Button variant={props.todolist.filter === 'all' ? 'outlined' : 'text'}
                    onClick={onAllClickHandler}
                    color={'default'}
            >All
            </Button>
            <Button variant={props.todolist.filter === 'active' ? 'outlined' : 'text'}
                    onClick={onActiveClickHandler}
                    color={'primary'}>Active
            </Button>
            <Button variant={props.todolist.filter === 'completed' ? 'outlined' : 'text'}
                    onClick={onCompletedClickHandler}
                    color={'secondary'}>Completed
            </Button>
        </div>
    </div>
})


