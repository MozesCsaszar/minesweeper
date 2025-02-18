import { GameSlice } from '../reducers/gameSlice';
import { IsValidPosition, RandInt } from './utils';
import * as _ from 'lodash';

export function getMineDensity(rows: number, cols: number, mines: number) {
    const area = (rows * cols);
    return mines / area;
}

function getDensityMultiplier(rows: number, cols: number, mines: number) {
    const density = getMineDensity(rows, cols, mines);
    return 1 + (density - 0.1) / (0.33 - 0.1) * 12;
}

export function getBoardDifficulty(rows: number, cols: number, mines: number) {
    return Math.floor(getDensityMultiplier(rows, cols, mines) * (rows * cols) / 13);
}

export function getMinesAround(row: number, col: number, board: number[][]) {
    let nr_mines = 0;
    for (let i = -1; i < 2; i++) {
        for (let j = -1; j < 2; j++) {
            if (IsValidPosition(row + i, col + j, board) && (i != 0 || j != 0)) {
                nr_mines += board[row + i][col + j] == -1 ? 1 : 0;
            }
        }
    }

    return nr_mines;
}

export function chordBoardField(row: number, col: number, mineTarget: number, state: GameSlice) {
    // count the number of mines around the current field
    let flagCount = 0;
    let nonFlagged: [number, number][] = [];
    // collect the non-flagged tiles around the clicked tile
    for (let i = row - 1; i < row + 2; i++) {
        for (let j = col - 1; j < col + 2; j++) {
            // make sure that the new position is valid inside of our board
            if (IsValidPosition(i, j, state.board)) {
                // only add tiles that aren't flagged or the one just clicked
                if (!(i == row && j == col)) {
                    if (!state.flagged[i][j]) {
                        nonFlagged.push([i, j]);
                    }
                    else {
                        flagCount++;
                    }
                }
            }
        }
    }

    // if enough tiles have been flagged, batch open the others
    if (flagCount == mineTarget) {
        batchOpen(nonFlagged, state);
    }
    else {
        state.movesMade++;
    }
}

export function toggleBoardFlag(row: number, col: number, state: GameSlice) {
    state.mines_remaining += state.flagged[row][col] ? 1 : -1;
    state.flagged[row][col] = !state.flagged[row][col];

    state.movesMade++;
}

export function createBoard(rows: number, cols: number, mines: number): number[][] {
    let board: number[][] = [];
    // generate board
    for (let i = 0; i < rows; i++) {
        board.push([]);
        for (let j = 0; j < cols; j++) {
            board[i].push(0);
        }
    }

    // add mines in a way that guarantees a certain number of mines on the board
    let mines_added = 0;
    while (mines_added < mines) {
        let [i, j] = [RandInt(rows), RandInt(cols)];
        // don't allow mines on corners
        if ([[0, cols - 1], [0, 0], [rows - 1, 0], [rows - 1, cols - 1]].find(v => i == v[0] && j == v[1]) == undefined) {
            mines_added += board[i][j] == -1 ? 0 : 1;
            board[i][j] = -1;
        }
    }

    // fill in adjecency info
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j] != -1) {
                board[i][j] = getMinesAround(i, j, board);
            }
        }
    }

    return board;
}

export function createBoolean(rows: number, cols: number, value: boolean): boolean[][] {
    let hidden: boolean[][] = [];
    for (let i = 0; i < rows; i++) {
        hidden.push([]);
        for (let j = 0; j < cols; j++) {
            hidden[i][j] = value;
        }
    }

    return hidden;
}

function endGameStatistics(state: GameSlice) {
    // figure out the mistakes in flag placement
    let mistakes: { [key: number]: { [key: number]: boolean } } = {};
    let flagged = _.cloneDeep(state.flagged);
    for (let i = 0; i < state.flagged.length; i++) {
        for (let j = 0; j < state.flagged[i].length; j++) {
            if (state.flagged[i][j] && state.board[i][j] != -1) {
                if (mistakes[i] == undefined) {
                    mistakes[i] = {};
                }
                mistakes[i][j] = true;
                flagged[i][j] = false;
            }
        }
    }
    return { mistakes, flagged };
}

export function setLost(last_move: [number, number], state: GameSlice): void {
    let { mistakes, flagged } = endGameStatistics(state);
    // set the incorrect mine open as a mistake
    if (mistakes[last_move[0]] == undefined) {
        mistakes[last_move[0]] = {};
    }
    mistakes[last_move[0]][last_move[1]] = true;

    state.hidden = createBoolean(state.rows, state.cols, false);
    state.flagged = flagged;
    state.lost = true;
    state.mistakes = mistakes;
}

function setHidden(hidden: boolean[][], cells_unopened: number, state: GameSlice): void {
    let won = cells_unopened == state.mines;

    // if victory was achieved
    if (won) {
        // create new state for flagged which flags all of the mines
        let flagged = createBoolean(state.rows, state.cols, false);
        for (let i = 0; i < state.rows; i++) {
            for (let j = 0; j < state.cols; j++) {
                flagged[i][j] = state.board[i][j] == -1;
            }
        }
        state.hidden = createBoolean(state.rows, state.cols, false);
        state.flagged = flagged;
        state.mines_remaining = 0;
        state.cells_unopened = cells_unopened;
        state.won = true;
    }
    // otherwise
    else {
        state.hidden = hidden;
        state.cells_unopened = cells_unopened;
    }
}
/**
 * Open more than one field on the board.
 * opens: a list of [row, col] values
 */
export function batchOpen(opens: [number, number][], state: GameSlice): void {
    state.movesMade++;

    // check whether there is a mine between the opens
    for (let i = 0; i < opens.length; i++) {
        let [row, col] = opens[i];
        if (state.board[row][col] == -1) {
            setLost([row, col], state);
            return;
        }
    }
    // if no mines were found, countinue with opening the needed fields
    // save which rows were changed to aviod copying unnecessary data
    let changed: { [key: number]: { [key: number]: boolean } } = {};
    let empties: number[][] = [];
    let opened = 0;

    // go through each of the opens, open them and check if they were empty
    for (let i = 0; i < opens.length; i++) {
        let [row, col] = opens[i];
        if (state.hidden[row][col]) {
            if (changed[row] == undefined) {
                changed[row] = [];
            }
            changed[row][col] = true;
            opened++;

            // add the current field to the empties list to open each cell around if needed
            if (state.board[row][col] == 0) {
                empties.push([row, col])
            }
        }
    }

    // while new empty fields have been opened, open all cells around them
    while (empties.length > 0) {
        let [row, col] = empties[0];
        empties.shift();

        // go around all of the empty locations and find everything to be uncovered
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                // make sure that the new position is valid inside of our board
                if (IsValidPosition(row + i, col + j, state.board)) {
                    // don't open flagged fields
                    if (!state.flagged[row + i][col + j]) {
                        // don't open the emtpy field already opened
                        if (!(i == 0 && j == 0)) {
                            if (state.hidden[row + i][col + j] && !changed[row + i]?.[col + j] && !state.flagged[row + i][col + i]) {
                                if (changed[row + i] == undefined) {
                                    changed[row + i] = [];
                                }
                                changed[row + i][col + j] = true;
                                opened++;
                                // if a new empty field was found, add it to the list
                                if (state.board[row + i][col + j] == 0) {
                                    empties.push([row + i, col + j]);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    let hidden: boolean[][] = [...state.hidden];
    let newArr: boolean[] = [];

    for (let i in changed) {
        newArr = _.cloneDeep(state.hidden[i]);
        for (let key in changed[i]) {
            newArr[Number(key)] = false;
        }
        hidden[Number(i)] = newArr;
    }

    // update the hidden status of the cells
    setHidden(hidden, state.cells_unopened - opened, state);
}