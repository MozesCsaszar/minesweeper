import React, { FC } from 'react';
import NumericInput from '../NumericInput/NumericInput';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../store';
import { setGuessing } from '../reducers/gameSlice';
import styles from '../NumericInput/NumericInput.module.css';


const mapState = (state: RootState) => ({
  guessing: state.game.guessing,
  guesses: state.game.guesses,
  flagGuesses: state.game.flagGuesses
})

const mapDispatch = {
  setGuessing
}

const connector = connect(mapState, mapDispatch);

interface GameToolsProps extends ConnectedProps<typeof connector> { }

const GameTools: FC<GameToolsProps> = (props) => {
  function generateToolUI(value: number, label: string, onClick: () => {}, selected: boolean) {
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
      {generateToolUI(props.guesses, 'Guesses', () => props.setGuessing(!props.guessing), props.guessing)}
      {<NumericInput value={props.flagGuesses} disabled label={'Flag Guesses'} />}
    </div>
  );
}
export default connector(GameTools);
