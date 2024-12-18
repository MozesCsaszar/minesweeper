'use client';

import React, { FC } from 'react';
import styles from './Field.module.css';

interface FieldProps {
  board: number[][],
  i: number,
  j: number,
  hidden: boolean[][],
  onClick: Function
}

const Field: FC<FieldProps> = ({board, i, j, hidden, onClick}) => {
  let style_names: {readonly [key: string]: string} = {'*': 'Mine', ' ': 'Empty', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight'};

  function valueToString(value: number) {
    return value == -1 ? 'X' : (value == 0 ? ' ' : String(value));
  }

  function value() {
    return board[i][j];
  }

  return (
    <div className={styles.Field} key={`key-${i}-${j}`}>
      <button className={styles.Top} onClick={() => onClick(i, j)} hidden={!hidden[i][j]}>
  
      </button>
      <div className={`${styles.Symbol} ${styles[style_names[value()]]}`} suppressHydrationWarning>
        {valueToString(value())}
      </div>
      <div className={styles.Background}>
  
      </div>
    </div>
  );
} 

export default Field;
