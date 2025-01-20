import React, { FC, useState } from 'react';
import styles from './BoardControl.module.css';
import NumericInput from '../NumericInput/NumericInput';
import { generateGame } from '../reducers/gameSlice';
import { RootState } from '../store';
import { connect, ConnectedProps } from 'react-redux';

const mapState = (state: RootState) => ({
  mines: state.game.mines,
  rows: state.game.rows,
  cols: state.game.cols,
  guesses: state.game.flagGuesses,
})

const mapDispatch = {
  generateGame
}

const connector = connect(mapState, mapDispatch);

// TODO: Rename this
interface BoardControlProps extends ConnectedProps<typeof connector> {
}

const BoardControl: FC<BoardControlProps> = (props) => {
  const [rows, setRows] = useState(props.rows);
  const [cols, setCols] = useState(props.cols);
  const [mines, setMines] = useState(props.mines);

  return (
    // TODO: Validate the inputs
    <div className='flex flex-col'>
      {NumericInput({ label: 'Rows', min: 10, max: 100, value: rows, setValue: setRows })}
      {NumericInput({ label: 'Columns', min: 10, max: 100, value: cols, setValue: setCols })}
      {NumericInput({ label: 'Mines', min: 10, max: rows * cols / 3, value: mines, setValue: setMines })}
      <button className='Button' onClick={() => props.generateGame({ rows, cols, mines, flagGuesses: 3, guesses: 1 })}>Update</button>
    </div>
  );
}

export default connector(BoardControl);
