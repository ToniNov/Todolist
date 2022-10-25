import thunkMiddleware from 'redux-thunk'
import {configureStore} from '@reduxjs/toolkit'
import {rootReducer} from "./reducers";

// непосредственно создаём store
export const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(thunkMiddleware)
})

export type RootState = ReturnType<typeof store.getState>

// а это, чтобы можно было в консоли браузера обращаться к store в любой момент
// @ts-ignore
window.store = store

// if (process.env.NODE_ENV === 'development' && module.hot) {
//     module.hot.accept('./reducers'), () => {
//         store.replaceReducer(rootReducer)
//     }
// }