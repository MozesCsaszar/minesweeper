import React, { FC, useState } from 'react';
import { generateGame } from '../reducers/gameSlice';
import { RootState } from '../store';
import { connect, ConnectedProps } from 'react-redux';
import { getMineDensity } from '../utils/boardUtils';
import { createInfoTooltip, createSelect, createTooltip, createValidatedTextField, InputMetadata, isFormValid } from '../utils/componentGenerators';
import { ValidateMaxValue, ValidateMinValue } from '../utils/validators';
import { Button, Collapse, IconButton } from '@mui/material';

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

interface DifficultyValues {
  rows: number,
  cols: number,
  mines: number,
  guesses: number,
  mineGuesses: number
}

const Difficulties: { [key: string]: (DifficultyValues | undefined) } = {
  beginner: {
    rows: 10,
    cols: 10,
    mines: 15,
    guesses: 3,
    mineGuesses: 0
  },
  intermediate: {
    rows: 16,
    cols: 16,
    mines: 40,
    guesses: 3,
    mineGuesses: 1
  },
  expert: {
    rows: 30,
    cols: 16,
    mines: 99,
    guesses: 3,
    mineGuesses: 2
  },
  master: {
    rows: 30,
    cols: 30,
    mines: 225,
    guesses: 5,
    mineGuesses: 3
  },
  grandmaster: {
    rows: 50,
    cols: 50,
    mines: 833,
    guesses: 10,
    mineGuesses: 15
  },
  custom: undefined
}

const defaultDifficulty = 'beginner';
const defaultDifficultyValues = Difficulties[defaultDifficulty];

const BoardControl: FC<BoardControlProps> = (props) => {
  function boardSizeChanged() {
    return String(props.rows) != rowsValue || String(props.cols) != colsValue || String(props.mines) != minesValue;
  }

  function changeDifficulty(value: string) {
    if (value != 'custom') {
      let d = Difficulties[value];
      if (d != undefined) {
        rowsSetValue(String(d.rows));
        colsSetValue(String(d.cols));
        minesSetValue(String(d.mines));
        guessesSetValue(String(d.guesses));
        mineGuessesSetValue(String(d.mineGuesses));
      }
    }
  }

  const [expanded, setExpanded] = useState(true);

  // create the difficulty select
  const [difficultyInput, difficultyMessage, difficultyValue, difficultySetValue] = createSelect({
    name: 'Difficulty', defVal: defaultDifficulty, required: true,
    values: Object.keys(Difficulties), names: (v) => v[0].toUpperCase() + v.slice(1),
    onValidChange: changeDifficulty
  });

  // create board selects
  const [rowsInput, rowsMessage, rowsValue, rowsSetValue] = createValidatedTextField({
    name: 'Rows', defVal: String(defaultDifficultyValues!.rows), validators: [ValidateMinValue(5), ValidateMaxValue(100)],
    required: true, disabled: difficultyValue != 'custom'
  })
  const [colsInput, colsMessage, colsValue, colsSetValue] = createValidatedTextField({
    name: 'Cols', defVal: String(defaultDifficultyValues!.cols), validators: [ValidateMinValue(5), ValidateMaxValue(100)],
    required: true, disabled: difficultyValue != 'custom'
  })
  const rowsColsValid = rowsMessage == '' && colsMessage == '';
  const area = rowsColsValid ? Number(rowsValue) * Number(colsValue) : 0;
  const [minesInput, minesMessage, minesValue, minesSetValue] = createValidatedTextField({
    name: 'Mines', defVal: String(defaultDifficultyValues!.mines), validators: rowsColsValid ? [ValidateMinValue(Math.floor(area / 7)), ValidateMaxValue(Math.ceil(area / 3))] : [],
    required: true, disabled: difficultyValue != 'custom'
  })
  const [guessesInput, guessesMessage, guessesValue, guessesSetValue] = createValidatedTextField({
    name: 'Guesses', defVal: String(defaultDifficultyValues!.guesses), validators: [ValidateMinValue(0), ValidateMaxValue(1000)],
    required: true, disabled: difficultyValue != 'custom'
  })
  const [mineGuessesInput, mineGuessesMessage, mineGuessesValue, mineGuessesSetValue] = createValidatedTextField({
    name: 'Flag Guesses', defVal: String(defaultDifficultyValues!.mineGuesses), validators: [ValidateMinValue(0), ValidateMaxValue(1000)],
    required: true, disabled: difficultyValue != 'custom'
  })

  const [rows, cols, mines, guesses, mineGuesses] = [Number(rowsValue), Number(colsValue), Number(minesValue), Number(guessesValue), Number(mineGuessesValue)];

  const valid = isFormValid(
    [difficultyMessage, rowsMessage, colsMessage, minesMessage, guessesMessage, mineGuessesMessage],
    [false, false, false, false, false, false, false]
  );

  return (
    // TODO: Validate the inputs
    <div className='flex flex-col'>
      <div className='flex flex-row'>
        <div>Game Options</div>
        <Button onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Hide' : 'Show'}
        </Button>
      </div>
      <Collapse in={expanded}>
        <div className='flex flex-col'>
          {/* Inputs for minefield statistics */}
          {[createInfoTooltip('The difficulty of the game, which will determine the number of rows, columns, mines, guesses and flag guesses. Custom mode allows for setting these values arbitrarily.', difficultyInput),
          createInfoTooltip('The number of rows in the game.', rowsInput),
          createInfoTooltip('The number of columns in the game.', colsInput),
          createInfoTooltip('The number of mines in the game.', minesInput),
          createInfoTooltip('The number of guesses allowed per game. When used, if clicking on an unopened cell, the cell will be opened if it does not contain a mine, flagged otherwise.', guessesInput),
          createInfoTooltip('The number of flag guesses allowed. To use, click on a flagged field. If it was not a mine, you lose. If it was a mine, a number will be displayed up on the flag showing the number of mines around the flagged cell (all 8 of them, excluding the center cell).', mineGuessesInput),]}
          {/* Difficulty (expected and current, if there is difference) */}
          {createInfoTooltip('The mine density of the board, expressed in percentages. This shows the chance of any one field being a mine.', <label>Mine Density: {valid ? (getMineDensity(rows, cols, mines) * 100).toFixed(2) : '???'}%</label>)}
          {/* <label>{(changed ? 'New Difficulty' : 'Difficluty') + ': ' + String(difficulty)}</label> */}
          {/* Update button */}
          {createTooltip('Update the board with the current settings.', <Button disabled={!valid} className='Button' onClick={() => props.generateGame({ rows, cols, mines, flagGuesses: mineGuesses, guesses })}>Update</Button>, 'bottom')}
        </div>
      </Collapse>
    </div>
  );
}

export default connector(BoardControl);
