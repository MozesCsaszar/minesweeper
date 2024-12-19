'use client';

import React, { act, FC, useReducer, useState } from 'react';
import Row from '../Row/Row';
import styles from './Game.module.css';
import { IsValidPosition, RandInt } from '../utils';
import * as _ from 'lodash';
import GameInfo from '../GameInfo/GameInfo';
import BoardControl from '../BoardControl/BoardControl';

interface CellAction {
  type: string,
  row: number,
  col: number
}

interface UpdateGameAction {
  type: string,
  rows: number,
  setRows: Function,
  cols: number,
  setCols: Function,
  mines: number,
  setMines: Function
}

export interface GameState {
  rows: number,
  cols: number,
  mines: number,
  board: number[][],
  hidden: boolean[][],
  flagged: boolean[][],
  cells_unopened: number,
  mines_remaining: number,
  lost: boolean,
  mistakes: { [key: number]: { [key: number]: boolean } },
  won: boolean
}

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

function createBoard(rows: number, cols: number) {
  let board: number[][] = [];
  // generate board
  for (let i = 0; i < rows; i++) {
    board.push([]);
    for (let j = 0; j < cols; j++) {
      board[i].push(0);
    }
  }
  return board;
}

function resetBoard(board: number[][]) {
  let rows = board.length, cols = board[0].length;

  // blank the board
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      board[i][j] = -2;
    }
  }

  return board;
}

function populateBoard(board: number[][], mines: number) {
  let rows = board.length, cols = board[0].length;

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

function createBoolean(rows: number, cols: number, value: boolean) {
  let hidden: boolean[][] = [];
  for (let i = 0; i < rows; i++) {
    hidden.push([]);
    for (let j = 0; j < cols; j++) {
      hidden[i][j] = value;
    }
  }

  return hidden;
}

function generateInitialGameState(): GameState {
  const init_rows = 100, init_cols = 100, init_mines = 1000;
  return {
    rows: init_rows,
    cols: init_cols,
    mines: init_mines,
    board: resetBoard(createBoard(init_rows, init_cols)),
    hidden: createBoolean(init_rows, init_cols, true),
    flagged: createBoolean(init_rows, init_cols, false),
    cells_unopened: init_rows * init_cols,
    mines_remaining: init_mines,
    won: false,
    lost: false,
    mistakes: {}
  }
}

function generateNewGame(gameState: GameState): GameState {
  return {
    ...gameState,
    board: populateBoard(resetBoard(createBoard(gameState.rows, gameState.cols)), gameState.mines),
    hidden: createBoolean(gameState.rows, gameState.cols, true),
    flagged: createBoolean(gameState.rows, gameState.cols, false),
    cells_unopened: gameState.rows * gameState.cols,
    mines_remaining: gameState.mines,
    won: false,
    lost: false,
    mistakes: {}
  };
}

function endGameStatistics(gameState: GameState) {
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

function setLost(last_move: [number, number], gameState: GameState): GameState {
  let { mistakes, flagged } = endGameStatistics(gameState);
  // set the incorrect mine open as a mistake
  if (mistakes[last_move[0]] == undefined) {
    mistakes[last_move[0]] = {};
  }
  mistakes[last_move[0]][last_move[1]] = true;

  return {
    ...gameState,
    // show all cells
    hidden: createBoolean(gameState.rows, gameState.cols, false),
    flagged: flagged,
    lost: true,
    mistakes: mistakes,
  };
}

function setHidden(hidden: boolean[][], cells_unopened: number, gameState: GameState): GameState {
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
    return {
      ...gameState,
      // show all cells
      hidden: createBoolean(gameState.rows, gameState.cols, false),
      // flag all mines
      flagged: flagged,
      mines_remaining: 0,
      cells_unopened: cells_unopened,
      won: true
    };
  }
  // otherwise
  else {
    return {
      ...gameState,
      // show all cells
      hidden: hidden,
      cells_unopened: cells_unopened,
    };
  }
}

function setFlagged(flagged: boolean[][], mines_remaining: number, gameState: GameState): GameState {
  return {
    ...gameState,
    flagged: flagged,
    mines_remaining: mines_remaining
  };
}

function setGameValues(rows: number, setRows: Function, cols: number, setCols: Function, mines: number, setMines: Function, gameState: GameState) {
  function validate(value: number, min: number, max: number) {
    return value < min ? min : (value > max ? max : value);
  }

  rows = validate(rows, 10, 100);
  cols = validate(cols, 10, 100);
  mines = validate(mines, Math.floor(rows * cols / 10), Math.ceil(rows * cols / 3));
  setRows(rows); setCols(cols); setMines(mines);

  // validate the row, column and mine values
  let newGameState = {
    ...gameState,
    rows,
    cols,
    mines
  }
  return generateNewGame(newGameState);
}

function openCorners(gameState: GameState): GameState {
  return batchOpen([[0, 0], [0, gameState.cols - 1], [gameState.rows - 1, 0], [gameState.rows - 1, gameState.cols - 1]], gameState);
}

function batchOpen(opens: [number, number][], gameState: GameState) {
  /**
   * Open more than one field on the board.
   * opens: a list of [row, col] values
   */
  // check whether there is a mine between the opens
  for (let i = 0; i < opens.length; i++) {
    let [row, col] = opens[i];
    if (gameState.board[row][col] == -1) {
      return setLost([row, col], gameState);
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
  return setHidden(hidden, gameState.cells_unopened - opened, gameState);
}

function cellActionReducer(gameState: GameState, action: CellAction) {
  let [row, col] = [action.row, action.col];

  switch (action.type) {
    case 'cell_open': {
      return batchOpen([[action.row, action.col]], gameState);
    }
    case 'cell_chord': {
      // count the number of mines around the current field
      let flag_count = 0;
      let non_flagged: [number, number][] = [];
      // collect the non-flagged tiles around the clicked tile
      for (let i = row - 1; i < row + 2; i++) {
        for (let j = col - 1; j < col + 2; j++) {
          // make sure that the new position is valid inside of our board
          if (IsValidPosition(i, j, gameState.board)) {
            // only add tiles that aren't flagged or the one just clicked
            if (!(i == row && j == col)) {
              if (!gameState.flagged[i][j]) {
                non_flagged.push([i, j]);
              }
              else {
                flag_count++;
              }
            }
          }
        }
      }

      // if enough tiles have been flagged, batch open the others
      if (flag_count == gameState.board[row][col]) {
        return batchOpen(non_flagged, gameState);
      }
      return gameState;
    }
    case 'cell_flag': {
      // clone flagged fields
      let draft = _.cloneDeep(gameState.flagged);
      let mines_remaining = gameState.mines_remaining;

      // update flagged information
      mines_remaining += draft[row][col] ? 1 : -1;
      draft[row][col] = !draft[row][col];

      // set the state
      return setFlagged(draft, mines_remaining, gameState);
    }
    case 'open_corners': {
      return openCorners(gameState);
    }
    case 'regenerate': {
      return generateNewGame(gameState);
    }
    default: {
      return gameState;
    }
  }
}

function updateActionReducer(gameState: GameState, action: UpdateGameAction): GameState {
  let { rows, setRows, cols, setCols, mines, setMines } = action;
  switch (action.type) {
    case ('update_game'): {
      return setGameValues(rows, setRows, cols, setCols, mines, setMines, gameState);
    }
    default: {
      return gameState;
    }
  }
}

function gameStateReducer(gameState: GameState, action: CellAction | UpdateGameAction): GameState {
  switch (true) {
    case ('row' in action): {
      return cellActionReducer(gameState, action);
    }
    case ('rows' in action): {
      return updateActionReducer(gameState, action);
    }
    default: {
      return gameState;
    }
  }

}

interface GameProps { }

const Game: FC<GameProps> = () => {
  function gameEnded() {
    return gameState.won || gameState.lost;
  }

  const [gameState, gameStateDispatch] = useReducer(gameStateReducer, generateInitialGameState());
  const [rows, setRows] = useState(gameState.rows);
  const [cols, setCols] = useState(gameState.cols);
  const [mines, setMines] = useState(gameState.mines);

  let rowElements = [];

  for (let i = 0; i < gameState.rows; i++) {
    rowElements.push(<Row boardSlice={gameState.board[i]} hiddenSlice={gameState.hidden[i]} flaggedSlice={gameState.flagged[i]}
      gameEnded={gameEnded()} mistakesSlice={gameState.mistakes[i]} row={i} dispatch={gameStateDispatch}
      key={`row-${i}`} />)
  }


  return (
    <div onContextMenu={(e) => e.preventDefault()} className={styles.Game}>
      {BoardControl({ rows, setRows, cols, setCols, mines, setMines, gameStateDispatch })}
      {GameInfo({ gameStateDispatch, gameState })}
      <div className={styles.Rows}>
        {rowElements}
      </div>
    </div>
  );

}
export default Game;
