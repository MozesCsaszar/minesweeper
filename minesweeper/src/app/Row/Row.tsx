'use client';

import React, { FC, memo } from 'react';
import styles from './Row.module.css';
import Field from '../Field/Field';
import { PositionActionPayload } from '../reducers/gameSlice';

interface RowProps {
  boardSlice: number[],
  hiddenSlice: boolean[],
  flaggedSlice: boolean[],
  mistakesSlice: { [key: string]: boolean } | undefined,
  guessedSlice: { [key: string]: number } | undefined,
  gameEnded: boolean,
  row: number,
  flagField: (params: PositionActionPayload) => void,
  clickField: (params: PositionActionPayload) => void,
  chordField: (params: PositionActionPayload) => void,
  guessField: (params: PositionActionPayload) => void,
  chordGuessedField: (params: PositionActionPayload) => void,
}

const Row: FC<RowProps> = ({ boardSlice, hiddenSlice, flaggedSlice, mistakesSlice, guessedSlice, gameEnded, row,
  flagField, chordField, clickField, guessField, chordGuessedField }) => {
  let fields = [];

  if (boardSlice != undefined) {
    for (let j = 0; j < boardSlice.length; j++) {
      fields.push(<Field value={boardSlice[j]} hidden={hiddenSlice[j]}
        flagged={flaggedSlice[j]} mistake={mistakesSlice?.[j]} row={row} col={j}
        gameEnded={gameEnded} key={`key-${row}-${j}`} flagField={flagField}
        clickField={clickField} chordField={chordField} flagGuessed={guessedSlice?.[j]}
        guessField={guessField} chordGuessedField={chordGuessedField} />)
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
