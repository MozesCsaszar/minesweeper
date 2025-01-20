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
  row: number,
  col: number,
  flagCell: (params: PositionActionPayload) => void,
  openCell: (params: PositionActionPayload) => void,
  chordCell: (params: PositionActionPayload) => void,
}

// TODO: pass callbacks down

const Field: FC<FieldProps> = ({ gameEnded, flagged, hidden, mistake, value, row, col, flagCell, openCell, chordCell }) => {
  let style_names: { readonly [key: string]: string } = { '🟌': 'Mine', ' ': 'Empty', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight' };

  function valueToString(value: number) {
    return value == -1 ? '🟌' : (value == 0 ? ' ' : String(value));
  }

  const valueString = useMemo(() => valueToString(value), [value]);

  return (
    <div className={styles.Field}>
      <div className={`${styles.Flag} NoHover Button`} onContextMenu={() => (!gameEnded) ? flagCell({ row, col }) : null} hidden={!flagged}>
        {<div></div>}
      </div>
      <button className={`${styles.Top} Button`} onClick={() => openCell({ row, col })} onContextMenu={() => flagCell({ row, col })} hidden={!hidden}>

      </button>
      <div className={`${styles.Symbol} ${styles[style_names[valueString]]}`} suppressHydrationWarning onClick={() => chordCell({ row, col })}>
        {hidden ? '' : valueToString(value)}
      </div>
      <div className={`${styles.Background}${(mistake ? ' ' + styles.Mistake : '')}`}>

      </div>
    </div>
  );
};

const arePropsEqual = (prevProps: Readonly<FieldProps>, nextProps: Readonly<FieldProps>) => {
  return prevProps.gameEnded == nextProps.gameEnded &&
    prevProps.flagged == nextProps.gameEnded && prevProps.hidden == nextProps.hidden
};

export default React.memo(Field);
