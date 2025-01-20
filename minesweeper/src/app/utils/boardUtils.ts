import { GameSlice } from '../reducers/gameSlice';
import { IsValidPosition, RandInt } from './utils';
import * as _ from 'lodash';

function getMinesAround(row: number, col: number, board: number[][]) {
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

function endGameStatistics(gameState: GameSlice) {
    // figure out the mistakes in flag placement
    let mistakes: { [key: number]: { [key: number]: boolean } } = {};
    let flagged = _.cloneDeep(gameState.flagged);
    for (let i = 0; i < gameState.flagged.length; i++) {
        for (let j = 0; j < gameState.flagged[i].length; j++) {
            if (gameState.flagged[i][j] && gameState.board[i][j] != -1) {
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

function setLost(last_move: [number, number], gameState: GameSlice): void {
    let { mistakes, flagged } = endGameStatistics(gameState);
    // set the incorrect mine open as a mistake
    if (mistakes[last_move[0]] == undefined) {
        mistakes[last_move[0]] = {};
    }
    mistakes[last_move[0]][last_move[1]] = true;

    gameState.hidden = createBoolean(gameState.rows, gameState.cols, false);
    gameState.flagged = flagged;
    gameState.lost = true;
    gameState.mistakes = mistakes;
}

function setHidden(hidden: boolean[][], cells_unopened: number, gameState: GameSlice): void {
    let won = cells_unopened == gameState.mines;

    // if victory was achieved
    if (won) {
        // create new state for flagged which flags all of the mines
        let flagged = createBoolean(gameState.rows, gameState.cols, false);
        for (let i = 0; i < gameState.rows; i++) {
            for (let j = 0; j < gameState.cols; j++) {
                flagged[i][j] = gameState.board[i][j] == -1;
            }
        }
        gameState.hidden = createBoolean(gameState.rows, gameState.cols, false);
        gameState.flagged = flagged;
        gameState.mines_remaining = 0;
        gameState.cells_unopened = cells_unopened;
        gameState.won = true;
    }
    // otherwise
    else {
        gameState.hidden = hidden;
        gameState.cells_unopened = gameState.cells_unopened;
    }
}

export function batchOpen(opens: [number, number][], gameState: GameSlice): void {
    /**
     * Open more than one field on the board.
     * opens: a list of [row, col] values
     */
    // check whether there is a mine between the opens
    for (let i = 0; i < opens.length; i++) {
        let [row, col] = opens[i];
        if (gameState.board[row][col] == -1) {
            setLost([row, col], gameState);
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
        if (gameState.hidden[row][col]) {
            if (changed[row] == undefined) {
                changed[row] = [];
            }
            changed[row][col] = true;
            opened++;

            // add the current field to the empties list to open each cell around if needed
            if (gameState.board[row][col] == 0) {
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
                if (IsValidPosition(row + i, col + j, gameState.board)) {
                    // don't open flagged fields
                    if (!gameState.flagged[row + i][col + j]) {
                        // don't open the emtpy field already opened
                        if (!(i == 0 && j == 0)) {
                            if (gameState.hidden[row + i][col + j] && !changed[row + i]?.[col + j] && !gameState.flagged[row + i][col + i]) {
                                if (changed[row + i] == undefined) {
                                    changed[row + i] = [];
                                }
                                changed[row + i][col + j] = true;
                                opened++;
                                // if a new empty field was found, add it to the list
                                if (gameState.board[row + i][col + j] == 0) {
                                    empties.push([row + i, col + j]);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    let hidden: boolean[][] = [...gameState.hidden];
    let newArr: boolean[] = [];

    for (let i in changed) {
        newArr = _.cloneDeep(gameState.hidden[i]);
        for (let key in changed[i]) {
            newArr[Number(key)] = false;
        }
        hidden[Number(i)] = newArr;
    }

    // update the hidden status of the cells
    setHidden(hidden, gameState.cells_unopened - opened, gameState);
}