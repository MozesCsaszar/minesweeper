'use client';

import React, { FC, useMemo } from 'react';
import styles from './Field.module.css';
import { PositionActionPayload } from '../reducers/gameSlice';

interface FieldProps {
  value: number,
  flagged: boolean,
  hidden: boolean,
  gameEnded: boolean,
  mistake: boolean | undefined,
  flagGuessed: number | undefined,
  row: number,
  col: number,
  flagField: (params: PositionActionPayload) => void,
  guessField: (params: PositionActionPayload) => void,
  clickField: (params: PositionActionPayload) => void,
  chordField: (params: PositionActionPayload) => void,
  chordGuessedField: (params: PositionActionPayload) => void,
}

const Field: FC<FieldProps> = ({ gameEnded, flagged, hidden, mistake, value, row, col,
  flagField, clickField, chordField, guessField, chordGuessedField, flagGuessed }) => {
  let style_names: { readonly [key: string]: string } = { '🟌': 'Mine', ' ': 'Empty', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine' };

  function valueToString(value: number) {
    return value == -1 ? '🟌' : (value == 0 ? ' ' : String(value));
  }

  const valueString = useMemo(() => valueToString(value), [value]);

  // TODO: Figure out if this should be +1 or not
  const guessedVal = flagGuessed == undefined ? undefined : flagGuessed;

  return (
    <div className={styles.Field}>
      {/* Flag  */}
      <div className={`${styles.Flag} NoHover Button`} hidden={!flagged}
        onClick={() => (!gameEnded && flagGuessed == undefined) ? guessField({ row, col }) : null}
        onContextMenu={() => !gameEnded && flagGuessed == undefined ? flagField({ row, col }) : null}>
        {/* Display the flagGuessed number if applicable */}
        {guessedVal != undefined ?
          <>
            {/* Foreground text */}
            <div onClick={() => { !gameEnded ? chordGuessedField({ row, col }) : null }} className={`${styles.Symbol} ${styles.SmallSymbol} ${styles[style_names[valueToString(guessedVal)]]}`}>
              {guessedVal}
            </div>
          </>
          : null}
      </div>
      {/* Top part */}
      <button className={`${styles.Top} Button`} onClick={() => clickField({ row, col })} onContextMenu={() => flagField({ row, col })} hidden={!hidden}>

        {/* Value part */}
      </button>
      <div className={`${styles.Symbol} ${styles[style_names[valueString]]}`} suppressHydrationWarning onClick={() => chordField({ row, col })}>
        {hidden ? '' : valueToString(value)}
      </div>
      {/* Background */}
      <div className={`${styles.Background} ${(mistake ? ' ' + styles.Mistake : '')}`}>

      </div>
    </div >
  );
};

const arePropsEqual = (prevProps: Readonly<FieldProps>, nextProps: Readonly<FieldProps>) => {
  return prevProps.gameEnded == nextProps.gameEnded &&
    prevProps.flagged == nextProps.gameEnded && prevProps.hidden == nextProps.hidden
};

export default React.memo(Field);
