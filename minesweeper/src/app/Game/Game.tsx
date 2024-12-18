'use client';


import React, { FC } from 'react';
import Row from '../Row/Row';
import styles from './Game.module.css';
import { IsValidPosition, PrettyLog } from '../utils';
import * as _ from 'lodash';

interface GameProps {
  // representation: -1 is a mine, 0-9 is the number of mines around
  board: number[][],
  hidden: boolean[][],
  setHidden: Function,
  regenerate: Function,
  i: number,
  j: number
}

const Game: FC<GameProps> = ({i, j, hidden, setHidden, board, regenerate}) => {
  function onFieldClick(i: number, j: number) {    

    if(board[i][j] == -1) {
      console.log("GAME OVER");
    }
    else {
      // clone hidden
      let draft = _.cloneDeep(hidden);
      let empties: number[][] = [];

      draft[i][j] = false;


      if(board[i][j] == 0) {
        empties.push([i, j])
      }

      while(empties.length > 0) {
        let [i, j] = empties[0];
        empties.shift();

        // go around all of the empty locations and find everything to be uncovered
        for(let k = -1; k < 2; k++) {
          for(let l = -1; l < 2; l++) {
            if(IsValidPosition(i + k, j + l, board)) {
              if(!(k == 0 && l == 0)) {
                if(draft[i + k][j + l]) {
                  draft[i + k][j + l] = false;
                  if(board[i + k][j + l] == 0) {
                    empties.push([i + k, j + l]);
                  }
                }
              }
            }
          }
        }
      }

      setHidden(draft);
    }
  }

  let rows = [];

  for(let y = 0; y < i; y++) {
    rows.push(Row({length: j, i: y, hidden: hidden, board: board, onClick: onFieldClick}));
  }


  return (
    <div className={styles.Game} suppressHydrationWarning={true}>
      <button onClick={() => {regenerate()}}>Regenerate</button><br></br>
      {rows}
    </div>
  );
  
} 
export default Game;
