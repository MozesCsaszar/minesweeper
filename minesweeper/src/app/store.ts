import { configureStore } from '@reduxjs/toolkit'
import gameReducer from './reducers/gameSlice';
import playerReducer from './reducers/playerSlice';
// ...

export const makeStore = () => {
    return configureStore({
        reducer: {
            game: gameReducer,
            player: playerReducer
        },
    })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']