'use client';

import React, { FC } from 'react';
import styles from './Field.module.css';
import { GameState } from '../page';

interface FieldProps {
  gameState: GameState,
  row: number,
  col: number,
  onClick: (row: number, col: number) => void,
  onFlag: (row: number, col: number) => void,
  onChord: (row: number, col: number) => void
}

const Field: FC<FieldProps> = ({ gameState: gameState, row: row, col: col, onClick, onFlag, onChord }) => {
  let style_names: { readonly [key: string]: string } = { '🟌': 'Mine', ' ': 'Empty', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight' };

  function valueToString(value: number) {
    return value == -1 ? '🟌' : (value == 0 ? ' ' : String(value));
  }

  function gameEnded() {
    return gameState.won || gameState.lost;
  }

  function value() {
    return gameState.board[row][col];
  }

  return (
    <div className={styles.Field} key={`key-${row}-${col}`}>
      <div className={`${styles.Flag} NoHover Button`} onContextMenu={() => (!gameEnded()) ? onFlag(row, col) : null} hidden={!gameState.flagged[row][col]}>
        <div className={`${styles.FlagChar}`}>⚑</div>
      </div>
      <button className={`${styles.Top} Button`} onClick={() => onClick(row, col)} onContextMenu={() => onFlag(row, col)} hidden={!gameState.hidden[row][col]}>

      </button>
      <div className={`${styles.Symbol} ${styles[style_names[valueToString(value())]]}`} suppressHydrationWarning onClick={() => onChord(row, col)}>
        {valueToString(value())}
      </div>
      <div className={`${styles.Background}${(gameState.mistakes[row]?.[col] ? ' ' + styles.Mistake : '')}`}>

      </div>
    </div>
  );
}

export default Field;
