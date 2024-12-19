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
  row: number,
  dispatch: Function
}

const Row: FC<RowProps> = ({ boardSlice, hiddenSlice, flaggedSlice, mistakesSlice, gameEnded, row, dispatch }) => {
  let fields = [];

  for (let j = 0; j < boardSlice.length; j++) {
    fields.push(<Field value={boardSlice[j]} hidden={hiddenSlice[j]}
      flagged={flaggedSlice[j]} mistake={mistakesSlice?.[j]} row={row} col={j}
      gameEnded={gameEnded} dispatch={dispatch} key={`key-${row}-${j}`} />)
  }

  return (
    <div className={styles.Row}>
      {fields}
    </div>
  );
};

const arePropsEqual = (prevProps: Readonly<RowProps>, nextProps: Readonly<RowProps>) => { return prevProps.gameEnded == nextProps.gameEnded && prevProps.flaggedSlice === nextProps.flaggedSlice && prevProps.hiddenSlice === nextProps.hiddenSlice };

export default React.memo(Row, arePropsEqual);
