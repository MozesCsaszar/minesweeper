import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { batchOpen, chordBoardField, createBoard, createBoolean, getMinesAround, setLost, toggleBoardFlag } from '../utils/boardUtils';

export interface GameParams {
    rows: number,
    cols: number,
    mines: number,
    flagGuesses: number,
    guesses: number
}

export interface GameTools {
    guessing: boolean,
}

export interface GameSlice extends GameParams, GameTools {
    board: number[][],
    flagged: boolean[][],
    flagGuessed: { [key: number]: { [key: number]: number } },
    hidden: boolean[][],
    mistakes: { [key: number]: { [key: number]: boolean } },
    cells_unopened: number,
    mines_remaining: number,
    won: boolean,
    lost: boolean,
    movesMade: number,
    currentFlagGuesses: number,
    currentGuesses: number,
    opening: [number, number] | undefined,
    oldOpening: [number, number] | undefined,
    chording: [number, number] | undefined
    oldChording: [number, number] | undefined,
}

export interface PositionActionPayload {
    row: number,
    col: number
}

const initialState: GameSlice = {
    rows: 10,
    cols: 10,
    mines: 15,
    flagGuesses: 0,
    currentFlagGuesses: 0,
    guesses: 3,
    currentGuesses: 3,
    cells_unopened: 0,
    mines_remaining: 0,
    won: false,
    lost: false,
    board: [],
    flagged: [],
    hidden: [],
    flagGuessed: {},
    mistakes: {},
    guessing: false,
    movesMade: 0,
    opening: undefined,
    oldOpening: undefined,
    chording: undefined,
    oldChording: undefined
}

function generateGameHelper(state: GameSlice) {
    // set default params
    state.currentFlagGuesses = state.flagGuesses;
    state.currentGuesses = state.guesses;
    state.opening = undefined;
    state.oldOpening = undefined;
    state.chording = undefined;
    state.oldChording = undefined;
    // set flagged, guesses and others
    state.mistakes = {};
    state.flagGuessed = {};
    state.hidden = createBoolean(state.rows, state.cols, true);
    state.flagged = createBoolean(state.rows, state.cols, false);
    // set tool usage
    state.guessing = false;
    // set win state
    state.won = false;
    state.lost = false;
    state.movesMade = 0;
    state.cells_unopened = state.rows * state.cols;
    state.mines_remaining = state.mines;
    // create the new board
    state.board = createBoard(state.rows, state.cols, state.mines);
}

// TODO: Set up a middleware to stop unwanted actions from going through at the end of the game
export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        flagField: (state, action: PayloadAction<PositionActionPayload>) => {
            const { row, col } = action.payload;

            // update flagged information
            toggleBoardFlag(row, col, state);
        },
        clickField: (state, action: PayloadAction<PositionActionPayload>) => {
            const { row, col } = action.payload;

            // if you are in guaranteed guessing mode
            if (state.guessing && state.currentGuesses > 0) {
                state.currentGuesses -= 1;
                // set guessing to false to not waste guesses accidentally
                state.guessing = false;

                // if mine, flag the field
                if (state.board[row][col] == -1) {
                    // update flagged information
                    toggleBoardFlag(row, col, state);
                }
                // else open the field
                else {
                    batchOpen([[row, col]], state);
                }
            }
            else {
                batchOpen([[row, col]], state);
            }
        },
        guessField: (state, action: PayloadAction<PositionActionPayload>) => {
            const { row, col } = action.payload;

            const guessed = state.flagGuessed[row]?.[col];

            // if guessing mode and have guesses remaining
            if (state.currentFlagGuesses > 0) {
                // if guessing on a wrongly flagged field, set lost
                if (state.board[row][col] != -1) {
                    setLost([row, col], state);
                }
                // else reveal number of mines around info
                else {
                    // if the flag has not been guessed yet
                    if (guessed == undefined) {
                        if (state.flagGuessed[row] == undefined) {
                            state.flagGuessed[row] = {};
                        }
                        state.flagGuessed[row][col] = getMinesAround(row, col, state.board);
                        state.currentFlagGuesses -= 1;
                    }
                }
            }

            state.movesMade++;
        },
        chordGuessedField: (state, action: PayloadAction<PositionActionPayload>) => {
            const { row, col } = action.payload;

            const guessed = state.flagGuessed[row]?.[col];

            if (guessed != undefined) {
                chordBoardField(row, col, guessed, state);
            }
            else {
                state.movesMade++;
            }
        },
        chordField: (state, action: PayloadAction<PositionActionPayload>) => {
            const { row, col } = action.payload;

            chordBoardField(row, col, state.board[row][col], state);
        },
        regenerateGame(state, _) {
            generateGameHelper(state);
        },
        generateGame: (state, action: PayloadAction<GameParams>) => {
            const { cols, rows, mines, guesses, flagGuesses } = action.payload;
            // set default params
            state.rows = rows;
            state.cols = cols;
            state.mines = mines;
            state.flagGuesses = flagGuesses;
            // state.currentFlagGuesses = flagGuesses;
            state.guesses = guesses;
            // state.currentGuesses = guesses;

            generateGameHelper(state);
            // state.opening = undefined;
            // state.oldOpening = undefined;
            // state.chording = undefined;
            // state.oldChording = undefined;
            // // set flagged, guesses and others
            // state.mistakes = {};
            // state.flagGuessed = {};
            // state.hidden = createBoolean(rows, cols, true);
            // state.flagged = createBoolean(rows, cols, false);
            // // set tool usage
            // state.guessing = false;
            // // set win state
            // state.won = false;
            // state.lost = false;
            // state.movesMade = 0;
            // state.cells_unopened = rows * cols;
            // state.mines_remaining = mines;
            // // create the new board
            // state.board = createBoard(rows, cols, mines);
        },
        openCorners: (state, _) => {
            batchOpen([[0, 0], [0, state.cols - 1], [state.rows - 1, 0],
            [state.rows - 1, state.cols - 1]], state);
        },
        setGuessing: (state, action: PayloadAction<boolean>) => {
            state.guessing = action.payload;
        },
        setOpening: (state, action: PayloadAction<[number, number] | undefined>) => {
            state.oldOpening = state.opening;
            state.opening = action.payload;
        },
        setChording: (state, action: PayloadAction<[number, number] | undefined>) => {
            state.oldChording = state.chording;
            state.chording = action.payload;
        },
        resetOpeningChording: (state, _) => {
            state.oldOpening = state.opening;
            state.opening = undefined;

            state.oldChording = state.chording;
            state.chording = undefined;
        }
    }
})

export const { flagField, clickField, chordField,
    generateGame, openCorners, setGuessing, regenerateGame,
    guessField, chordGuessedField, setOpening, setChording, resetOpeningChording } = gameSlice.actions;

export default gameSlice.reducer;