'use client';


import { useState } from "react";
import Game from "./Game/Game";
import { IsValidPosition, PrettyLog, RandInt } from "./utils";

function getMinesAround(i: number, j: number, board: number[][]) {
  let nr_mines = 0;
  for(let k = -1; k < 2; k++) {
    for(let l = -1; l < 2; l++) {
      if(IsValidPosition(i + k, j + l, board) && (k != 0 || l != 0)) {
        nr_mines += board[i + k][j + l] == -1 ? 1 : 0;
      }
    }
  }

  return nr_mines;
}

function createBoard(i: number, j: number) {
  let board: number[][] = [];
  // generate board
  for(let y = 0; y < i; y++) {
    board.push([]);
    for(let x = 0; x < j; x++) {
      board[y].push(0);
    }
  }
  return board;
}

function resetBoard(board: number[][]) {
  let i = board.length, j = board[0].length;

  // blank the board
  for(let y = 0; y < i; y++) { 
    for(let x = 0; x < j; x++) {
      board[y][x] = -2;
    }
  }

  return board;
}

function populateBoard(board: number[][], mines: number) {
  let i = board.length, j = board[0].length;



  // add mines
  for(let m = 0; m < mines; m++) {
    board[RandInt(i)][RandInt(j)] = -1;
  }
  // fill in adjecency info
  for(let y = 0; y < i; y++) {
    for(let x = 0; x < j; x++) {
      if(board[y][x] != -1) {
        board[y][x] = getMinesAround(y, x, board);
      }
    }
  }

  PrettyLog(board);

  return board;
}

function createHidden(i: number, j: number) {
  let hidden: boolean[][] = [];
  for(let y = 0; y < i; y++) {
    hidden.push([]);
    for(let x = 0; x < j; x++) {
      hidden[y][x] = true;
    }
  }

  return hidden;
}

function populateHidden(hidden: boolean[][]) {
  let i = hidden.length, j = hidden[0].length;

  for(let y = 0; y < i; y++) {
    for(let x = 0; x < j; x++) {
      hidden[y][x] = true;
    }
  }

  return hidden;
}

const init_i = 5, init_j = 5, init_mines = 1;
const initialData = {
  board: resetBoard(createBoard(init_i, init_j)),
  hidden: populateHidden(createHidden(init_i, init_j))
}

export default function Home() {
  const [i, setI] = useState(init_i);
  const [j, setJ] = useState(init_j);
  const [mines, setMines] = useState(init_mines);

  const [board, setBoard] = useState(initialData.board);
  const [hidden, setHidden] = useState(initialData.hidden);
  const [gameState, setGameState] = useState({lost: false, won: false, last_move:[-1,-1]})

  function regenerate() {
    setBoard(populateBoard(resetBoard(createBoard(i, j)), mines));
    setHidden(populateHidden(createHidden(i, j)));
  }

  return (
    Game({i: i, j: j, hidden: hidden, setHidden: setHidden, board: board, regenerate: regenerate})
  );
}
