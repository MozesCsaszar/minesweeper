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

    if (gameState.board[row][col] == -1) {
      setLost([row, col]);
    }
    else {
      // clone hidden
      let draft = _.cloneDeep(gameState.hidden);
      let empties: number[][] = [];
      let opened = 1;

      draft[row][col] = false;

      // add the current field to the empties list to open each cell around if needed
      if (gameState.board[row][col] == 0) {
        empties.push([row, col])
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
                  if (draft[row + i][col + j]) {
                    draft[row + i][col + j] = false;
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
      setHidden(draft, gameState.cells_unopened - opened);
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
    rows.push(Row({ gameState: gameState, row: i, onClick: onFieldClick, onFlag: onFieldFlagged }));
  }


  return (
    <div onContextMenu={(e) => e.preventDefault()} className={styles.Game}>
      {GameInfo({ regenerate: regenerate, gameState })}
      <div className={styles.Rows}>
        {rows}
      </div>
    </div>
  );

}
export default Game;
