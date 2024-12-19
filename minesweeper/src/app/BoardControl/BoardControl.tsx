import React, { FC } from 'react';
import styles from './BoardControl.module.css';
import NumericInput from '../NumericInput/NumericInput';

interface BoardControlProps {
  rows: number,
  setRows: Function,
  cols: number,
  setCols: Function,
  mines: number,
  setMines: Function,
  gameStateDispatch: Function
}

const BoardControl: FC<BoardControlProps> = ({ rows, setRows, cols, setCols, mines, setMines, gameStateDispatch }) => {

  return (
    <div className={styles.BoardControl}>
      {NumericInput({ label: 'Rows', min: 10, max: 100, value: rows, setValue: setRows })}
      {NumericInput({ label: 'Columns', min: 10, max: 100, value: cols, setValue: setCols })}
      {NumericInput({ label: 'Mines', min: 10, max: rows * cols / 3, value: mines, setValue: setMines })}
      <button className='Button' onClick={() => gameStateDispatch({ type: 'update_game', rows, setRows, cols, setCols, mines, setMines })}>Update</button>
    </div>
  );
}

export default BoardControl;
