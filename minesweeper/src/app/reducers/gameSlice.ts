import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { batchOpen, createBoard, createBoolean } from '../utils/boardUtils';

export interface GameParams {
    rows: number,
    cols: number,
    mines: number,
    guesses: number,
}

export interface GameSlice extends GameParams {
    board: number[][],
    flagged: boolean[][],
    guessed: { [key: number]: { [key: number]: boolean } },
    hidden: boolean[][],
    mistakes: { [key: number]: { [key: number]: boolean } },
    cells_unopened: number,
    mines_remaining: number,
    won: boolean,
    lost: boolean
}

export interface PositionActionPayload {
    row: number,
    col: number
}

const initialState: GameSlice = {
    rows: 10,
    cols: 10,
    mines: 15,
    guesses: 3,
    cells_unopened: 0,
    mines_remaining: 0,
    won: false,
    lost: false,
    board: [],
    flagged: [],
    hidden: [],
    guessed: {},
    mistakes: {}
}

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        flagCell: (state, action: PayloadAction<PositionActionPayload>) => {
            const { row, col } = action.payload;

            // update flagged information
            state.mines_remaining += state.hidden[row][col] ? 1 : -1;
            state.hidden[row][col] = !state.hidden[row][col];
            state.flagged[row][col] = !state.flagged[row][col];
        },
        openCell: (state, action: PayloadAction<PositionActionPayload>) => {
            batchOpen([[action.payload.row, action.payload.col]], state);
        },
        chordCell: (state, action: PayloadAction<PositionActionPayload>) => {

        },
        guessCell: (state, action: PayloadAction<PositionActionPayload>) => {

        },
        generateGame: (state, action: PayloadAction<GameParams>) => {
            const { cols, rows, mines, guesses } = action.payload;
            // set default params
            state.rows = rows;
            state.cols = cols;
            state.mines = mines;
            state.guesses = guesses;
            // set flagged, guesses and others
            state.mistakes = {};
            state.guessed = {};
            state.hidden = createBoolean(rows, cols, true);
            state.flagged = createBoolean(rows, cols, false);
            // set win state
            state.won = false;
            state.lost = false;
            state.cells_unopened = rows * cols;
            state.mines_remaining = mines;
            // create the new board
            state.board = createBoard(rows, cols, mines);
            console.log(state.board);
        },
        openCorners: (state, _) => {
            batchOpen([[0, 0], [0, state.cols - 1], [state.rows - 1, 0],
            [state.rows - 1, state.cols - 1]], state);
        }
    }
})

export const { flagCell, openCell, chordCell, guessCell, generateGame, openCorners } = gameSlice.actions;

export default gameSlice.reducer;