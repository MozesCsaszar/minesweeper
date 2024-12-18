'use client';

import React, { FC } from 'react';
import Row from '../Row/Row';
import styles from './Game.module.css';
import { IsValidPosition } from '../utils';
import * as _ from 'lodash';
import { GameState } from '../page';
import GameInfo from '../GameInfo/GameInfo';

interface GameProps {
  gameState: GameState,
  setHidden: (hidden: boolean[][], cells_unopened: number) => void,
  setFlagged: (hidden: boolean[][], mines_remaining: number) => void,
  setLost: (last_move: [number, number]) => void,
  regenerate: Function,
}

const Game: FC<GameProps> = ({ gameState, setHidden, setFlagged, setLost, regenerate }) => {
  function onFieldClick(row: number, col: number) {
    /**
     * Open one field with [row, col] coordinates.
     */
    batchOpen([[row, col]]);
  }

  function openCorners() {
    batchOpen([[0, 0], [0, gameState.cols - 1], [gameState.rows - 1, 0], [gameState.rows - 1, gameState.cols - 1]]);
  }

  function batchOpen(opens: [number, number][]) {
    /**
     * Open more than one field on the board.
     * opens: a list of [row, col] values
     */
    // check whether there is a mine between the opens
    for (let i = 0; i < opens.length; i++) {
      let [row, col] = opens[i];
      if (gameState.board[row][col] == -1) {
        setLost([row, col]);
        return;
      }
    }
    // if no mines were found, countinue with opening the needed fields
    // clone hidden
    let hidden = _.cloneDeep(gameState.hidden);
    let empties: number[][] = [];
    let opened = 0;

    // go through each of the opens, open them and check if they were empty
    for (let i = 0; i < opens.length; i++) {
      let [row, col] = opens[i];
      if (hidden[row][col]) {
        hidden[row][col] = false;
        opened++;
      }

      // add the current field to the empties list to open each cell around if needed
      if (gameState.board[row][col] == 0) {
        empties.push([row, col])
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
                if (hidden[row + i][col + j] && !gameState.flagged[row + i][col + i]) {
                  hidden[row + i][col + j] = false;
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

    // update the hidden status of the cells
    setHidden(hidden, gameState.cells_unopened - opened);
  }

  function onFieldChord(row: number, col: number) {
    // count the number of mines around the current field
    let flag_count = 0;
    let non_flagged: [number, number][] = [];
    // collect the non-flagged tiles around the clicked tile
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        // make sure that the new position is valid inside of our board
        if (IsValidPosition(row + i, col + j, gameState.board)) {
          // only add tiles that aren't flagged or the one just clicked
          if (!(i == 0 && j == 0)) {
            if (!gameState.flagged[row + i][col + j]) {
              non_flagged.push([row + i, col + j]);
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
      batchOpen(non_flagged);
    }
  }

  function onFieldFlagged(row: number, col: number) {
    // clone flagged fields
    let draft = _.cloneDeep(gameState.flagged);
    let mines_remaining = gameState.mines_remaining;

    // update flagged information
    mines_remaining += draft[row][col] ? 1 : -1;
    draft[row][col] = !draft[row][col];

    // set the state
    setFlagged(draft, mines_remaining);
  }

  let rows = [];

  for (let i = 0; i < gameState.rows; i++) {
    rows.push(Row({ gameState: gameState, row: i, onClick: onFieldClick, onFlag: onFieldFlagged, onChord: onFieldChord }));
  }


  return (
    <div onContextMenu={(e) => e.preventDefault()} className={styles.Game}>
      {GameInfo({ openCorners, regenerate, gameState })}
      <div className={styles.Rows}>
        {rows}
      </div>
    </div>
  );

}
export default Game;
