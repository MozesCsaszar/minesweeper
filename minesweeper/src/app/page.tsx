'use client';

import { useState } from "react";
import Game from "./Game/Game";
import { IsValidPosition, PrettyLog, RandInt } from "./utils";
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

function generateInitialGameState(): GameState {
  const init_rows = 20, init_cols = 20, init_mines = 80;
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

function generateNewGame(gameState: GameState, setGameSate: Function) {
  setGameSate({
    ...gameState,
    board: populateBoard(resetBoard(createBoard(gameState.rows, gameState.cols)), gameState.mines),
    hidden: createBoolean(gameState.rows, gameState.cols, true),
    flagged: createBoolean(gameState.rows, gameState.cols, false),
    cells_unopened: gameState.rows * gameState.cols,
    mines_remaining: gameState.mines,
    won: false,
    lost: false,
    mistakes: {}
  });
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

function setLost(last_move: [number, number], gameState: GameState, setGameSate: Function) {
  let { mistakes, flagged } = endGameStatistics(gameState);
  // set the incorrect mine open as a mistake
  if (mistakes[last_move[0]] == undefined) {
    mistakes[last_move[0]] = {};
  }
  mistakes[last_move[0]][last_move[1]] = true;

  setGameSate({
    ...gameState,
    // show all cells
    hidden: createBoolean(gameState.rows, gameState.cols, false),
    flagged: flagged,
    lost: true,
    mistakes: mistakes,
  });
}

function setHidden(hidden: boolean[][], cells_unopened: number, gameState: GameState, setGameSate: Function) {
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
    setGameSate({
      ...gameState,
      // show all cells
      hidden: createBoolean(gameState.rows, gameState.cols, false),
      // flag all mines
      flagged: flagged,
      mines_remaining: 0,
      cells_unopened: cells_unopened,
      won: true
    });
  }
  // otherwise
  else {
    setGameSate({
      ...gameState,
      // show all cells
      hidden: hidden,
      cells_unopened: cells_unopened,
    });
  }
}

function setFlagged(flagged: boolean[][], mines_remaining: number, gameState: GameState, setGameSate: Function) {
  setGameSate({
    ...gameState,
    flagged: flagged,
    mines_remaining: mines_remaining
  })
}

function setGameValues(rows: number, setRows: Function, cols: number, setCols: Function, mines: number, setMines: Function, gameState: GameState, setGameState: Function) {
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
  generateNewGame(newGameState, setGameState);
}

export default function Home() {
  const [gameState, setGameSate] = useState(generateInitialGameState());
  const [rows, setRows] = useState(gameState.rows);
  const [cols, setCols] = useState(gameState.cols);
  const [mines, setMines] = useState(gameState.mines);

  function regenerate() {
    generateNewGame(gameState, setGameSate);
  }

  return (
    Game({
      rows, setRows, cols, setCols, mines, setMines,
      gameState: gameState,
      setFlagged: (flagged: boolean[][], mines_remaining: number) => setFlagged(flagged, mines_remaining, gameState, setGameSate),
      setHidden: (hidden: boolean[][], cells_unopened: number) => setHidden(hidden, cells_unopened, gameState, setGameSate),
      setLost: (last_move: [number, number]) => setLost(last_move, gameState, setGameSate),
      regenerate: regenerate,
      setGameValues: () => setGameValues(rows, setRows, cols, setCols, mines, setMines, gameState, setGameSate)
    })
  );
}
