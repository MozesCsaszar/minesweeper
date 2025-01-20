import { createSlice } from '@reduxjs/toolkit';

export interface PlayerSlice {

}

const initialState: PlayerSlice = {

}

export const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {}
})

export const { } = playerSlice.actions;

export default playerSlice.reducer;