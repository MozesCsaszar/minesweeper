'use client';

import React, { FC, memo, useMemo } from 'react';
import styles from './Field.module.css';
import { GameState } from '../page';

interface FieldProps {
  value: number,
  flagged: boolean,
  hidden: boolean,
  gameEnded: boolean,
  mistake: boolean | undefined,
  row: number,
  col: number,
  onClick: (row: number, col: number) => void,
  onFlag: (row: number, col: number) => void,
  onChord: (row: number, col: number) => void
}

const Field: FC<FieldProps> = ({ gameEnded, flagged, hidden, mistake, value, row, col, onClick, onFlag, onChord }) => {
  let style_names: { readonly [key: string]: string } = { '🟌': 'Mine', ' ': 'Empty', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight' };

  function valueToString(value: number) {
    return value == -1 ? '🟌' : (value == 0 ? ' ' : String(value));
  }

  const valueString = useMemo(() => valueToString(value), [value]);

  return (
    <div className={styles.Field}>
      <div className={`${styles.Flag} NoHover Button`} onContextMenu={() => (!gameEnded) ? onFlag(row, col) : null} hidden={!flagged}>
        <div className={`${styles.FlagChar}`}>⚑</div>
      </div>
      <button className={`${styles.Top} Button`} onClick={() => onClick(row, col)} onContextMenu={() => onFlag(row, col)} hidden={!hidden}>

      </button>
      <div className={`${styles.Symbol} ${styles[style_names[valueString]]}`} suppressHydrationWarning onClick={() => onChord(row, col)}>
        {valueToString(value)}
      </div>
      <div className={`${styles.Background}${(mistake ? ' ' + styles.Mistake : '')}`}>

      </div>
    </div>
  );
};

const arePropsEqual = (prevProps: Readonly<FieldProps>, nextProps: Readonly<FieldProps>) => { return prevProps.gameEnded == nextProps.gameEnded && prevProps.flagged == nextProps.gameEnded && prevProps.hidden == nextProps.hidden && prevProps.onClick === nextProps.onClick };

export default React.memo(Field, arePropsEqual);
