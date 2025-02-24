import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface PlayerResources {
    materials: { [key: string]: number },
    money: number,
    experience: number
}


export interface PlayerSlice extends PlayerResources {
    guesses: number,
    mineGuesses: number
}

const initialState: PlayerSlice = {
    money: 0,
    experience: 0,
    materials: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, mine: 0
    },
    guesses: 1,
    mineGuesses: 3
}

export const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        addResources: (state, action: PayloadAction<PlayerResources>) => {
            state.money += action.payload.money;
            state.experience += action.payload.experience;
            for (const key in state.materials) {
                state.materials[key] += action.payload.materials[key];
            }
        }
    }
})

export const { } = playerSlice.actions;

export default playerSlice.reducer;