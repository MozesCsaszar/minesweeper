'use client';

import React, { FC, memo } from 'react';
import styles from './Row.module.css';
import Field from '../Field/Field';

interface RowProps {
  boardSlice: number[],
  hiddenSlice: boolean[],
  flaggedSlice: boolean[],
  mistakesSlice: { [key: string]: boolean } | undefined
  gameEnded: boolean,
  onClick: (row: number, col: number) => void,
  onFlag: (row: number, col: number) => void,
  onChord: (row: number, col: number) => void
  row: number,
}

const Row: FC<RowProps> = ({ boardSlice, hiddenSlice, flaggedSlice, mistakesSlice, gameEnded, row, onFlag, onChord, onClick }) => {
  let fields = [];

  for (let j = 0; j < boardSlice.length; j++) {
    fields.push(<Field value={boardSlice[j]} hidden={hiddenSlice[j]}
      flagged={flaggedSlice[j]} mistake={mistakesSlice?.[j]} row={row} col={j} onChord={onChord}
      onClick={onClick} onFlag={onFlag} gameEnded={gameEnded} key={`key-${row}-${j}`} />)
  }

  return (
    <div className={styles.Row}>
      {fields}
    </div>
  );
};

export default React.memo(Row);
