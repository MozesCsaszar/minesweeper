'use client';

import React, { FC, useEffect } from 'react';
import Row from '../Row/Row';
import styles from './Game.module.css';
import * as _ from 'lodash';
import GameInfo from '../GameInfo/GameInfo';
import BoardControl from '../BoardControl/BoardControl';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { chordCell, flagCell, generateGame, openCell, openCorners } from '../reducers/gameSlice';

const mapState = (state: RootState) => ({
  game: state.game
})

const mapDispatch = {
  flagCell, openCell, chordCell, generateGame, openCorners
}

const connector = connect(mapState, mapDispatch);

// TODO: Remove this
// function cellActionReducer(gameState: GameState, action: CellAction) {
//   switch (action.type) {
//     case 'cell_chord': {
//       // count the number of mines around the current field
//       let flag_count = 0;
//       let non_flagged: [number, number][] = [];
//       // collect the non-flagged tiles around the clicked tile
//       for (let i = row - 1; i < row + 2; i++) {
//         for (let j = col - 1; j < col + 2; j++) {
//           // make sure that the new position is valid inside of our board
//           if (IsValidPosition(i, j, gameState.board)) {
//             // only add tiles that aren't flagged or the one just clicked
//             if (!(i == row && j == col)) {
//               if (!gameState.flagged[i][j]) {
//                 non_flagged.push([i, j]);
//               }
//               else {
//                 flag_count++;
//               }
//             }
//           }
//         }
//       }

//       // if enough tiles have been flagged, batch open the others
//       if (flag_count == gameState.board[row][col]) {
//         return batchOpen(non_flagged, gameState);
//       }
//       return gameState;
//     }
//   }

interface GameProps extends ConnectedProps<typeof connector> { }

const Game: FC<GameProps> = (props) => {
  function gameEnded() {
    return props.game.won || props.game.lost;
  }

  // initialize the game the first time around
  useEffect(() => {
    props.generateGame({ rows: props.game.rows, cols: props.game.cols, mines: props.game.mines, guesses: props.game.guesses })
  }, []);

  let rowElements = [];

  for (let i = 0; i < props.game.rows; i++) {
    rowElements.push(<Row
      boardSlice={props.game.board[i]} hiddenSlice={props.game.hidden[i]} flaggedSlice={props.game.flagged[i]}
      gameEnded={gameEnded()} mistakesSlice={props.game.mistakes[i]} row={i}
      key={`row-${i}`} openCell={props.openCell} flagCell={props.flagCell} chordCell={props.chordCell}
    />)
  }

  return (
    <div onContextMenu={(e) => e.preventDefault()} className={styles.Game}>
      {<BoardControl />}
      {<GameInfo />}
      <div className={styles.Rows}>
        {rowElements}
      </div>
    </div>
  );

}
export default connector(Game);
