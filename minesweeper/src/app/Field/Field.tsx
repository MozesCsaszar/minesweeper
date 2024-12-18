'use client';

import React, { FC } from 'react';
import styles from './Field.module.css';
import { GameState } from '../page';

interface FieldProps {
  gameState: GameState,
  row: number,
  col: number,
  onClick: (row: number, col: number) => void,
  onFlag: (row: number, col: number) => void
}

const Field: FC<FieldProps> = ({ gameState: gameState, row: row, col: col, onClick, onFlag }) => {
  let style_names: { readonly [key: string]: string } = { '*': 'Mine', ' ': 'Empty', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight' };

  function valueToString(value: number) {
    return value == -1 ? 'X' : (value == 0 ? ' ' : String(value));
  }

  function value() {
    return gameState.board[row][col];
  }

  return (
    <div className={styles.Field} key={`key-${row}-${col}`}>
      <div className={`${styles.Flag} Button`} onContextMenu={() => onFlag(row, col)} hidden={!gameState.flagged[row][col]}>

      </div>
      <button className={`${styles.Top} Button`} onClick={() => onClick(row, col)} onContextMenu={() => onFlag(row, col)} hidden={!gameState.hidden[row][col]}>

      </button>
      <div className={`${styles.Symbol} ${styles[style_names[value()]]}`} suppressHydrationWarning>
        {valueToString(value())}
      </div>
      <div className={`${styles.Background}${(gameState.last_move[0] == row && gameState.last_move[1] == col ? ' ' + styles.Mistake : '')}`}>

      </div>
    </div>
  );
}

export default Field;
