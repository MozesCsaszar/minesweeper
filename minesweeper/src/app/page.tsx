'use client';

import { useState } from "react";
import Game from "./Game/Game";
import { IsValidPosition, PrettyLog, RandInt } from "./utils";


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

  // add mines
  for (let m = 0; m < mines; m++) {
    board[RandInt(rows)][RandInt(cols)] = -1;
  }
  // fill in adjecency info
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (board[i][j] != -1) {
        board[i][j] = getMinesAround(i, j, board);
      }
    }
  }

  PrettyLog(board);

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
  last_move: [number, number],
  won: boolean
}

function generateInitialGameState(): GameState {
  const init_rows = 10, init_cols = 10, init_mines = 20;
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
    last_move: [-1, -1]
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
    lost: false
  });
}

function setLost(last_move: [number, number], gameState: GameState, setGameSate: Function) {
  setGameSate({
    ...gameState,
    // show all cells
    hidden: createBoolean(gameState.rows, gameState.cols, false),
    lost: true,
    last_move: last_move
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

export default function Home() {
  const [gameState, setGameSate] = useState(generateInitialGameState());

  function regenerate() {
    generateNewGame(gameState, setGameSate);
  }

  return (
    Game({
      gameState: gameState,
      setFlagged: (flagged: boolean[][], mines_remaining: number) => setFlagged(flagged, mines_remaining, gameState, setGameSate),
      setHidden: (hidden: boolean[][], cells_unopened: number) => setHidden(hidden, cells_unopened, gameState, setGameSate),
      setLost: (last_move: [number, number]) => setLost(last_move, gameState, setGameSate),
      regenerate: regenerate
    })
  );
}
