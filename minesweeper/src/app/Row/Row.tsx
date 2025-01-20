'use client';

import React, { FC, memo } from 'react';
import styles from './Row.module.css';
import Field from '../Field/Field';
import { PositionActionPayload } from '../reducers/gameSlice';

interface RowProps {
  boardSlice: number[],
  hiddenSlice: boolean[],
  flaggedSlice: boolean[],
  mistakesSlice: { [key: string]: boolean } | undefined
  gameEnded: boolean,
  row: number,
  flagCell: (params: PositionActionPayload) => void,
  openCell: (params: PositionActionPayload) => void,
  chordCell: (params: PositionActionPayload) => void,
}

const Row: FC<RowProps> = ({ boardSlice, hiddenSlice, flaggedSlice, mistakesSlice, gameEnded, row, flagCell, chordCell, openCell }) => {
  let fields = [];

  if (boardSlice != undefined) {
    for (let j = 0; j < boardSlice.length; j++) {
      fields.push(<Field value={boardSlice[j]} hidden={hiddenSlice[j]}
        flagged={flaggedSlice[j]} mistake={mistakesSlice?.[j]} row={row} col={j}
        gameEnded={gameEnded} key={`key-${row}-${j}`} flagCell={flagCell}
        openCell={openCell} chordCell={chordCell} />)
    }
  }

  return (
    <div className={styles.Row}>
      {fields}
    </div>
  );
};

const arePropsEqual = (prevProps: Readonly<RowProps>, nextProps: Readonly<RowProps>) => { return prevProps.gameEnded == nextProps.gameEnded && prevProps.flaggedSlice === nextProps.flaggedSlice && prevProps.hiddenSlice === nextProps.hiddenSlice };

export default memo(Row);
