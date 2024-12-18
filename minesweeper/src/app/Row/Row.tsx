'use client';

import React, { FC, MouseEventHandler } from 'react';
import styles from './Row.module.css';
import Field from '../Field/Field';
import { GameState } from '../page';

interface RowProps {
  gameState: GameState,
  onClick: (row: number, col: number) => void,
  onFlag: (row: number, col: number) => void,
  onChord: (row: number, col: number) => void
  row: number,
}

const Row: FC<RowProps> = ({ gameState, row, onFlag, onChord, onClick }) => {
  let fields = [];

  for (let j = 0; j < gameState.board[row].length; j++) {
    fields.push(Field({ gameState: gameState, row: row, col: j, onClick: onClick, onFlag: onFlag, onChord: onChord }));
  }

  return (
    <div className={styles.Row} key={`row-${row}`}>
      {fields}
    </div>
  );
}

export default Row;
