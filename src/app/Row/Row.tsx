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
  chording: [number, number] | undefined,
  opening: [number, number] | undefined,
  flagField: (params: PositionActionPayload) => void,
  clickField: (params: PositionActionPayload) => void,
  chordField: (params: PositionActionPayload) => void,
  guessField: (params: PositionActionPayload) => void,
  chordGuessedField: (params: PositionActionPayload) => void,
  setOpening: (params: [number, number] | undefined) => void,
  setChording: (params: [number, number] | undefined) => void,
}

const Row: FC<RowProps> = ({ boardSlice, hiddenSlice, flaggedSlice, mistakesSlice, guessedSlice, gameEnded, row, chording, opening,
  flagField, chordField, clickField, guessField, chordGuessedField, setOpening, setChording }) => {

  function hiddenFieldAnimation(row: number, col: number) {
    if (opening != undefined) {
      return opening[0] == row && opening[1] == col;
    }
    else if (chording != undefined) {
      return (row == chording[0] + 1 || row == chording[0] - 1 || row == chording[0]) && (col == chording[1] + 1 || col == chording[1] - 1 || col == chording[1]) && !(row == chording[0] && col == chording[1]);
    }
    return false;
  }

  const fields = [];

  if (boardSlice != undefined) {
    for (let j = 0; j < boardSlice.length; j++) {
      fields.push(<Field value={boardSlice[j]} hidden={hiddenSlice[j]} hiddenAnimation={hiddenFieldAnimation(row, j)}
        flagged={flaggedSlice[j]} mistake={mistakesSlice?.[j]} row={row} col={j}
        gameEnded={gameEnded} key={`key-${row}-${j}`} flagField={flagField}
        openField={clickField} chordField={chordField} flagGuessed={guessedSlice?.[j]}
        guessField={guessField} chordGuessedField={chordGuessedField}
        setOpening={setOpening} setChording={setChording} />)
    }
  }

  return (
    <div className={styles.Row}>
      {fields}
    </div>
  );
};

// const arePropsEqual = (prevProps: Readonly<RowProps>, nextProps: Readonly<RowProps>) => { return prevProps.gameEnded == nextProps.gameEnded && prevProps.flaggedSlice === nextProps.flaggedSlice && prevProps.hiddenSlice === nextProps.hiddenSlice };

export default memo(Row);
