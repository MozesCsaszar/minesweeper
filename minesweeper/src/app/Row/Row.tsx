'use client';

import React, { FC, MouseEventHandler } from 'react';
import styles from './Row.module.css';
import Field from '../Field/Field';

interface RowProps {
  length: number,
  i: number,
  board: number[][],
  onClick: Function,
  hidden: boolean[][],
}

const Row: FC<RowProps> = ({board, i, length, hidden, onClick}) => {
  let fields = [];

  for(let x = 0; x < length; x++) {
    fields.push(Field({board: board, i: i, j: x, hidden: hidden, onClick: onClick}));
  }

  return (
    <div className={styles.Row} key={`row-${i}`}>
      {fields}
    </div>
  );
}

export default Row;
