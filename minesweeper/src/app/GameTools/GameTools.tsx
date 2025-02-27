import React, { FC } from 'react';
import NumericInput from '../NumericInput/NumericInput';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { setGuessing } from '../reducers/gameSlice';
import styles from '../NumericInput/NumericInput.module.css';
import { createInfoTooltip } from '../utils/componentGenerators';


const mapState = (state: RootState) => ({
  guessing: state.game.guessing,
  currentGuesses: state.game.currentGuesses,
  currentFlagGuesses: state.game.currentFlagGuesses
})

const mapDispatch = {
  setGuessing
}

const connector = connect(mapState, mapDispatch);

const GameTools: FC<ConnectedProps<typeof connector>> = (props) => {
  function generateToolUI(value: number, label: string, onClick: () => void, selected: boolean) {
    return <div className={`${styles.NumericInput} flex flex-row`}>
      <label>
        {`${label}: `}
      </label>
      <input readOnly={value == 0} checked={selected} className='ml-auto mt-4 mr-1 h-5 basis-6' type='checkbox' onChange={value != 0 ? onClick : undefined}></input>
      <input disabled type='text' inputMode='numeric' name={label} value={value}></input>
    </div>
  }

  return (
    <div className='flex flex-col'>
      {createInfoTooltip('To use a guess, please select the checkbox. This will guarantee that a cell opening will not result in a loss. For more details, see the tooltip next to "Guesses" at game options.',
        generateToolUI(props.currentGuesses, 'Guesses', () => props.setGuessing(!props.guessing), props.guessing))}
      {createInfoTooltip('The number of flag guesses remaining. When clicking on a flag, this provide more information if it has any uses. If the tile was not a mine, the game is lost. For more details, see the tooltip next to "Flag Guesses" at game options.',
        <NumericInput value={props.currentFlagGuesses} disabled label={'Flag Guesses'} />)}
    </div>
  );
}
export default connector(GameTools);
